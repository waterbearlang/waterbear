/**
 * @overview
 * @author Eddie Antonio Santos <easantos@ualberta.ca>
 * @description
 *
 * This file exports a single class called {@link Process WaterbearProcess}
 * that encapsulates *all* of the state for **one** run of a Waterbear script.
 * In order to run the script again after one has terminated, a new {@link
 * Process} must be instantiated.
 *
 * Each `Process` consists of one or more *re-entrant* "{@link Strand strands}"
 * (also known as [fibres][]—a similar concept to threads, but without
 * parallelism). Strands may be the root strand, a strand per-frame handler that
 * runs on [requestAnimationFrame][], or a context that subscribes to a given
 * event, such as the `receive` block, the geolocation, or motion blocks.
 *
 * Each `Strand` keeps an **instruction pointer** which points to the *next*
 * block to execute. {@link Strand#doNext} executes exactly one step block or
 * initiates one context block. This automatically updates the instruction
 * pointer, which (as of April 2015) delegates to the block to determine which
 * block is next in the instruction stream. Context blocks are special cases,
 * since they may establish a new **frame** of execution.
 *
 * A {@link Frame} (think *call frame*, *stack frame*, or if you're into
 * antediluvian terms, an activation record) keeps track of scope for a
 * particular **container** of blocks. A container is simply a list of blocks
 * that will run in order. Frames represent places where a new scope may be
 * extended, or simply where there's a new container of blocks (like the in an
 * `if` block). A block may establish a new frame, in which case the governing
 * `Strand` will execute every instruction of this frame until it has run out of
 * instructions, at which point the frame will pop-out, and the remaining
 * instructions in the parent frame are run in order.
 *
 * To recap: a {@link Process} is made of one or more instances of {@link
 * Strand}, which will start a new {@link Frame} stack with one frame: the root
 * frame. Execution of the root frame may push and execute a frames on top of
 * the stack. A strand is finished once its root frame has no more remaining
 * instructions (however, see {@link ReusableStrand}). A process is finished
 * once it has no more remaining strands.
 *
 * [fibres]: http://en.wikipedia.org/wiki/Fiber_(computer_science)
 * [requestAnimationFrame]: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
 */
window.WaterbearProcess = (function () {
    'use strict';

    var assert = console.assert.bind(console);

    /**
     * Wraps state for the execution of a single frame (as in "stack frame" or
     * even "activation record", if you will) of execution. Several frames make
     * up a {@link Strand}.
     *
     * Note that the stack behaviour of frames is maintained by the parent
     * Strand, and not the frame. However, the current scope is ultimately a
     * property of a frame.
     *
     * @constructor
     * @param {ContextBlock} context - Associated context block. Can be `null`.
     * @param {Container} activeContainer - The first container to be run.
     * @param {Scope} scope - The scope to use.
     * @param {Function} [continuationCallback] - Called at end of execution.
     * @alias Frame
     */
    function Frame(context, activeContainer, scope, continuationCallback) {
        this.context = context;
        this.activeContainer = activeContainer;
        /** @member {Scope} Frame#scope the current scope for this frame. */
        this.scope = scope;
        this.shouldContinue = continuationCallback || null;
    }

    /**
     * Pseudo-property: the containers that belong to the associated context.
     * Note that a frame may *not* be associated with a context, thus not have
     * any containers.
     * @member {Container[]} Frame#containers
     */
    Object.defineProperty(Frame.prototype, 'containers', {
        get: function () {
            return this.context.gatherContainers();
        }
    });

    /**
     * Pseudo-property: the first instruction of the active container
     * @member {Block} Frame#firstInstruction
     */
    Object.defineProperty(Frame.prototype, 'firstInstruction', {
        get: function () {
            return this.activeContainer.firstInstruction;
        }
    });

    /**
     * Creates a new (usually root) frame from a <wb-contains> element.  That
     * is, this frame is **NOT** associated with a context!
     */
    Frame.createFromContainer = function createFromContainer(container, scope) {
        /* Note: this does not actually instantiate an actual Frame object.
         * Sneaky sneaky! */
        var actualScope = scope || Object.create(null);
        return {
            activeContainer: container,
            context: null,
            args: null,
            shouldContinue: null,
            scope: actualScope,
            /* Pseudo-properties. */
            firstInstruction: container.firstInstruction,
            containers: null,
        };
    };

    /**
     * Creates a new frame from the given <wb-context>, active on the given
     * container.
     */
    Frame.createFromContext = function (context, container, scope, callback) {
        return new Frame(context, container, scope, callback);
    };

    /**
     * Creates a new frame from an existing frame.
     */
    Frame.createFromFrame = function (frame) {
        return new Frame(frame.context,
                         frame.activeContainer,
                         frame.scope,
                         frame.shouldContinue);
    };



    /**
     * A single strand of execution! Think of it like a thread: it keeps track
     * of the next instruction to execute, and has an execution stack, which is
     * organized into several {@link Frame frames}. Maintains the scope.
     *
     * @constructor
     * @param {Frame} rootFrame - The bottommost frame in the frame stack.
     * @param {Process} process - The parent process.
     * @alias Strand
     */
    function Strand(rootFrame, process) {
        this.process = process;
        this.currentInstruction = rootFrame.firstInstruction;

        this.frames = [rootFrame];

        /* Private: used to ensure that context handler calls a method that
         * spawns a new strand or frame. It may also call Strand#noOperation to
         * explicitly opt out of spawning a new strand or frame. */
        this.undertakenAction = null;
    }

    /**
     * Pseudo-property: `currentFrame` is the active (i.e., topmost) frame in
     * the frame stack.
     *
     * @member {Frame} Strand#currentFrame 
     */
    Object.defineProperty(Strand.prototype, 'currentFrame', {
        get: function () {
            return this.frames[0];
        }
    });

    /**
     * Pseudo-property: alias to the current scope active in the active (i.e.,
     * topmost) frame in the frame stack.
     *
     * @member {Scope} Strand#scope 
     */
    Object.defineProperty(Strand.prototype, 'scope', {
        get: function () {
            return this.currentFrame.scope;
        }
    });

    /**
     * Runs the next instruction, updating the instruction pointer and scope
     * as appropriate.
     *
     * Returns: true if this strand has more instructions to execute.
     */
    Strand.prototype.doNext = function doNext() {
        assert(this.currentInstruction !== null,
               'Cannot `doNext` when current instruction undefined.');

        if (isContext(this.currentInstruction)) {
            /* This *WILL* set the next instruction. */
            this.undertakenAction = false;
            this.currentInstruction.run(this, this.currentFrame);
            assert(this.undertakenAction,
                  'API error: runtime function did not call one of ' +
                    'strand.{newFrame, newScope, newFrameHandler, newEventHandler, noOperation}');
        } else {
            assert(this.currentInstruction.tagName == 'WB-STEP');
            /* FIXME: (#904) wrap this with error handling of some kind. */
            this.currentInstruction.run(this.scope);
            this.currentInstruction = this.next();
        }

        return this.currentInstruction !== null;
    };

    /**
     * Creates a new frame of execution without creating a new scope.
     */
    Strand.prototype.newFrame = function newFrame(container, continuationCallback) {
        this.pushNewFrameFromThisContext(container, this.scope, continuationCallback);
        this.undertakenAction = true;
    };

    /**
     * Creates a new frame of execution with a new scope. That is,
     * all new variables defined in this scope will disappear once this frame
     * has ended.
     */
    Strand.prototype.newScope = function newScope(container, continuationCallback) {

        /* Augment the current scope! */
        var scope = Object.create(this.scope);

        this.pushNewFrameFromThisContext(container, scope, continuationCallback);
        this.undertakenAction = true;
    };

    /**
     * Starts a new thread whose blocks will be run before each animation
     * frame.
     *
     * NOTE: the "frame" in "frame handler" is for **animation** frames. Do
     * not confuse this with execution frames (the Frame class in this file).
     */
    Strand.prototype.newFrameHandler = function newFrameHandler(container) {
        /* Delegate to the process. */
        this.process.addFrameHandler(container);

        /* Just go on our merry way. */
        this.undertakenAction = true;
        this.currentInstruction = this.currentInstruction.next();
    };

    /**
     * Registers a new event handler for the given event.
     *
     * @todo Not implemented.
     */
    Strand.prototype.newEventHandler = function newEventHandler(event, container) {
        /* FIXME: (#1083) Write this! */
        assert(false, 'Not implemented.');
        this.undertakenAction = true;
        this.currentInstruction = this.currentInstruction.next();
    };

    /**
     * Explicitly specifies that no action be undertaken.
     *
     * This must be called to silence the warning that would otherwise be
     * raised.
     */
    Strand.prototype.noOperation = function noOperation() {
        this.undertakenAction = true;
        this.currentInstruction = this.currentInstruction.next();
    };

    /* Private use: */

    /**
     * Get the next instruction in this strand.
     * @private
     */
    Strand.prototype.next = function next() {
        var nextInstruction;

        /* Delegate to the block itself. */
        nextInstruction = this.currentInstruction.next();

        assert(nextInstruction === null || typeof nextInstruction.run === 'function',
               'Block does not have a callable property `run`');

        /* Handle frame stuff here. */
        if (nextInstruction === null) {
            return this.switchFrame();
        }

        return nextInstruction;
    };

    /**
     * Add a frame to the execution stack
     * @private
     */
    Strand.prototype.pushNewFrameFromThisContext = function (container, scope, callback) {
        var frame, context;
        context = this.currentInstruction;

        assert(isContext(context));
        frame = Frame.createFromContext(context, container, scope, callback);
        this.frames.unshift(frame);

        this.currentInstruction = this.currentFrame.firstInstruction;
    };

    /**
     * Called when there's a possibility to restart this frame, or yield to
     * the previous frame.
     *
     * @returns {Block} the next instruction to run.
     * @private
     */
    Strand.prototype.switchFrame = function switchFrame() {
        var oldFrame = this.currentFrame;
        /* Ask shouldContinue() if we should switch to a new container-- if
         * shouldContinue exists! */
        var nextContainer = oldFrame.shouldContinue && oldFrame.shouldContinue();

        assert(nextContainer === null || nextContainer.tagName === 'WB-CONTAINS');

        if (nextContainer === null) {
            /* This frame has been exhausted! */
            this.frames.shift();
            return oldFrame.context && oldFrame.context.next();
        } else {
            this.frames[0] = Frame.createFromFrame(oldFrame);
            return this.currentFrame.firstInstruction;
        }
    };

    /**
     * Creates the root strand—that is, the strand from which all other strands
     * originate from.
     */
    Strand.createRootStrand = function createRootStrand(process) {
        var globalScope = {},
            /* FIXME: (#1112) Rely less on the DOM.! */
            container = dom.find('wb-workspace > wb-contains'),
            frame = Frame.createFromContainer(container, globalScope);

        assert(!!process, "Must be called with a process.");

        return new Strand(frame, process);
    };


    /**
     * A strand that whose root frame can be run many, many times.
     * Intended for implementing event handlers and frame handlers.
     *
     * @see Strand
     * @constructor
     * @extends Strand
     * @alias ReusableStrand
     */
    function ReusableStrand(rootFrame) {
        /* Call super() constructor. */
        Strand.apply(this, arguments);

        this.rootFrame = rootFrame;
    }

    /* Inherit methods from Strand. */
    ReusableStrand.prototype = Object.create(Strand.prototype);

    /**
     * Psuedo-property: Yields the first instruction of the root frame.  In
     * other words, the very first instruction that should ever be executed.
     *
     * @member {Block} ReusableStrand#firstInstruction 
     */
    Object.defineProperty(ReusableStrand.prototype, 'firstInstruction', {
        get: function () {
            return this.rootFrame.firstInstruction;
        }
    });

    /**
     * Runs everything nested within synchronously.
     */
    ReusableStrand.prototype.startSync = function () {
        var thereAreMoreInstructions;

        /* Check if we're in the middle of the frame. */
        if (this.currentInstruction === null) {
            /* Reset to the initial frame. */
            this.resetFrames();
        }

        do {
            thereAreMoreInstructions = this.doNext();
        } while (thereAreMoreInstructions);
    };

    /**
     * Resets the frame if the current instruction is undefined.
     * Delegates to {@link Strand}.
     */
    ReusableStrand.prototype.doNext = function doNext() {
        if (!this.currentInstruction) {
            this.resetFrames();
        }
        return Strand.prototype.doNext.apply(this, arguments);
    };

    /**
     * Unsupported operation.
     */
    ReusableStrand.prototype.newFrameHandler = function () {
        throw new Error("Nesting frame handlers is a bad idea, m'kay?");
    };

    /**
     * Unsupported operation.
     */
    ReusableStrand.prototype.newEventHandler = function () {
        throw new Error("Refusing to create events within an event/frame.");
    };

    /*
     * Private methods!
     */

    /**
     * Clears all frames in the frame stack EXCEPT for the root frame.
     * The next instruction is set as the first instruction in the root frame.
     * @private
     */
    ReusableStrand.prototype.resetFrames = function () {
        this.frames = [Frame.createFromFrame(this.rootFrame)];
        this.currentInstruction =  this.currentFrame.firstInstruction;
    };



    /**
     * Encapsulates the execution of a Waterbear program. Composed of several
     * {@link Strand} instances, and this should encompase all of the state for
     * a single run of Waterbear.
     *
     * This is a "one-time use" object! This means that once {@link
     * Process#start} is called, it cannot be started all over again.
     * Similarly, once {@link Process#terminate} is called, you can consider
     * this object useless.
     *
     * Options
     * -------
     * <dl>
     * <dt> `startPaused`
     * <dd> Whether to start paused. Calling `start()` will immediately pause
     * before executing the first instruction.
     * <dt> `emitter`
     * <dd> Callback with signature {@link Process~emitter (name: String, data:
     * Object)}.
     *
     * Called when Process wants to trigger events.  If not provided, events
     * are silently discarded.
     *
     * </dl>
     *
     *
     * @todo More rich process abstraction.
     *
     * @constructor
     * @param {Object} [options] - a list of options.
     * @alias Process
     */
    function Process(options) {
        var started = false;
        /* Default to empty. */
        options = options || {};

        /* Set some essential state. */
        this.strands = [];

        /* Related to frame handlers -- probably should split this out into
         * its own class. */
        this.perFrameHandlers = [];
        this.lastTime = new Date().valueOf();
        this.currentAnimationFrameHandler = null;
        /* Indicates that the next block should step. */
        this.shouldStep = false;

        /* Can only be one strand scheduled at a time. */
        this.currentStrand = null;
        this.paused = (!!options.startPaused) || false;

        /* Set an optional emitter. */
        this.emitter = options.emitter || null;

        /* Disable breakpoints. */
        this.shouldBreak = false;
        /* Run as quickly as possible. */
        this.delay = 0;
        this.nextTimeout = null;

        /* `doNextStep` is the same as `nextStep`, but it is bound to this
         * object, so it never forgets who it belongs to, even when used in
         * setTimeout/setImmediate! */
        this.doNextStep = this.nextStep.bind(this);

        /*
         * This `started` tomfoolery ensures that the Process object is a
         * "one-time use" object.  Once it's started, it can't be started
         * again; and once it's terminated, it's gone for good. Want to start
         * again? Instantiate a brand new Process()!
         */
        Object.defineProperties(this, {
            /* `started` is trapped in this closure, thus it can only be
             * changed in this constructor, or any function defined within this
             * constructor. */
            started: {
                get: function () { return started; },
                enumerable: true
            },
            /* Once this is called, started can never be `false`. */
            setStarted: {
                value: function () { started = true; },
                enumerable: false
            }
        });
    }

    /**
     * Psuedo-property: The next instruction to execute in the currently
     * scheduled strand.
     *
     * @member {Block} Process#nextInstruction 
     */
    Object.defineProperty(Process.prototype, 'nextInstruction', {
        get: function () {
            return this.currentStrand.currentInstruction;
        }
    });

    /**
     * Starts (asynchronous!) execution from scratch. Can only be called once.
     */
    Process.prototype.start = function start() {
        assert(!this.started, 'Waterbear already started!');
        this.setStarted();

        /* NOTE: There was a plan to start a process on any arbitrary
         * instruction, but it didn't seem to be as useful as I had first
         * thought. */
        this.currentStrand = Strand.createRootStrand(this);

        this.strands.push(this.currentStrand);

        /* This starts asynchronous execution. */
        this.scheduleNextStep();

        this.emit('started');
        if (this.paused) {
            this.emit('paused');
        }

        return this;
    };

    /**
     * Resume executing immediately. Execution is as fast as the rate given to
     * {@link Process#setRate} (default: unlimited).
     */
    Process.prototype.resume = function resume() {
        assert(this.started);

        this.paused = false;
        this.scheduleNextStep();

        this.emit('resume');
        return this;
    };

    /**
     * Does one step of the next scheduled strand. Asynchronously!
     * When the only strand left belongs to per-frame handlers, these will be
     * scheduled and executed.
     */
    Process.prototype.step = function step() {
        if (!this.paused) {
            throw new Error('Can only step while paused.');
        }

        this.shouldStep = true;

        /* Do one step, discarding its handler. */
        this.scheduleNextStep();
        return this;
    };

    /**
     * Requests execution to pause before the next instruction.
     */
    Process.prototype.pause = function pause() {
        assert(this.started);
        this.paused = true;

        this.emit('pause');
        return this;
    };

    /**
     * Sets rate of execution in milliseconds / instruction.
     * If rate is not provided or undefined, the rate is unlimited.
     *
     * @see Process#unlimited
     */
    Process.prototype.setRate = function setRate(rate) {
        if (rate === undefined) {
            this.delay = 0;
        } else {
            assert((+rate) > 0, 'Must provide positive number for rate.');
            this.delay = +rate;
        }
        return this;
    };

    /**
     * Process will run unlimited, without any delay in its execution.
     * @see Process#setRate
     */
    Process.prototype.unlimited = function unlimited() {
        return this.setRate();
    };

    /**
     * Requests to cleanly terminates the current process.  Once this has
     * happened, this process can no longer be used.
     *
     * @param {Process~emitter} callback the callback lol
     */
    Process.prototype.terminate = function terminate(callback) {
        assert(this.started);
        this.cancelNextTimeout();
        this.clearPerFrameHandlers();

        /* Call the callback as promised... */
        if (callback) {
            setImmediate(callback);
        }
        return this;
    };

    /**
     * Enables all breakpoints. Execution will pause on all breakpoints.
     */
    Process.prototype.enableBreakpoints = function enableBreakpoints() {
        this.shouldBreak = true;
        return this;
    };

    /**
     * Disables all breakpoints. Execution will continue regardless if there
     * is any breakpoint set on an instruction.
     */
    Process.prototype.disableBreakpoints = function disableBreakpoints() {
        this.shouldBreak = false;
        return this;
    };

    /*= Internal methods =*/

    /**
     * Note: the constructor should bind an alias to this method called
     * `doNextStep` which simply calls this but BINDS `this` TO THE METHOD
     * CALL (which is the only way anything will ever work :/).
     * @private
     */
    Process.prototype.nextStep = function nextStep() {
        var hasNext;
        this.nextTimeout = null;
        this.shouldStep = false;

        assert(!!this.currentStrand, "No strand to run!");

        hasNext = this.currentStrand.doNext();

        if (!hasNext) {
            /* Remove the current strand. */
            assert(this.currentStrand === this.strands[0],
                   'More than one strand currently unsupported.');
            this.strands.shift();
            /* Schedule the next strand. */
            this.currentStrand = this.strands[0] || null;
        }

        /* Setup the next step to run after delay. */
        this.scheduleNextStep();
    };

    /**
     * Uses the emitter provided in options to emit events.
     * @private
     */
    Process.prototype.emit = function emit(name, data) {
        if (this.emitter === null) {
            return;
        }
        return this.emitter(name, data);
    };

    /**
     * (Maybe) schedules the next instruction to run.
     *
     * @private
     */
    Process.prototype.scheduleNextStep = function scheduleNextStep() {
        assert(this.nextTimeout === null,
               'Tried to schedule a callback when one is already scheduled.');

        if (this.strands.length < 1) {
            /* Nothing to schedule. */
            return;
        }

        /* TODO: (#1058) Decide if we should pause at this instruction due to a
         * breakpoint, error condition, etc. */

        /* Issue an event of which step is the next to execute. */
        if (this.paused && this.nextInstruction) {
            /* This is enqueuing on behalf of a step. */
            this.emitNextInstruction();
        }

        if (!this.paused || this.shouldStep) {
            /* Either we're running at full speed, or the next step is
             * requested. */
            this.scheduleRegularStrandInstructionExecution();
        }
    };

    /**
     * It schedules the execution of the next regular strand instruction!
     */
    Process.prototype.scheduleRegularStrandInstructionExecution = function () {
        assert(this.strands.length && this.currentStrand !== null,
               'Trieds to schedule a standard thread, but none exist.');
        this.nextTimeout = enqueue(this.doNextStep, this.delay);
    };

    /**
     * Emits 'step' for the next scheduled instruction.
     */
    Process.prototype.emitNextInstruction = function (instruction) {
        /* Called with no arguments, assume the nextInstruction. */
        if (arguments.length === 0) {
            instruction = this.nextInstruction;
        }

        assert(!!instruction, 'Must emit a valid instruction.');
        this.emit('step', {target: instruction});
    };

    /**
     * Runs blocks during requestAnimationFrame().
     */
    Process.prototype.handleAnimationFrame = function onAnimationFrame() {
        assert(this.perFrameHandlers.length === 1,
              'animation frame supports exactly per-frame handler.');
        var frameStrand = this.perFrameHandlers[0];
        var currTime = new Date().valueOf();

        /* Do I dare change these not quite global variables? */
        runtime.control._elapsed = currTime - this.lastTime;
        /* FIXME: (#1120) This does not trivially allow for multiple eachFrame
         * handlers! */
        runtime.control._frame++;
        /* Why, yes, I do dare. */

        this.lastTime = currTime;

        if (!this.paused && this.delay === 0) {
            /* Running normally. */
            /* Run ALL of the frame handlers synchronously. */
            this.perFrameHandlers.forEach(function (strand){
                strand.startSync();
            });
        } else if (this.shouldStep && this.currentStrand === null) {
            /* Running is delayed or paused. Run one step. */
            this.shouldStep = false;
            frameStrand.doNext();
            /* Execute the queue instruction, or the first if no instruction
             * is queued. */
            this.emitNextInstruction(frameStrand.currentInstruction ||
                                     frameStrand.firstInstruction);
        }

        /* Enqueue the next call for this function. */
        this.currentAnimationFrameHandler =
            requestAnimationFrame(this.onAnimationFrame);
    };

    /**
     * Intended to be called by {@link Strand#newFrameHandler}.
     * Given a container, creates a special strand for per-frame handlers, and
     * adds it to the list of tracked frame handlers.
     *
     * @todo Support more than one frame handler.
     * @private
     */
    Process.prototype.addFrameHandler = function addFrameHandler(container) {
        if (this.perFrameHandlers.length > 0) {
            throw new Error('Cannot install more than one per-frame handler. Yet!');
        }

        var frame = Frame.createFromContainer(container, this.currentStrand.scope);
        var strand = new ReusableStrand(frame, this);

        this.perFrameHandlers.push(strand);
        this.startEventLoop();

        /* Schedule the first instruction of the brand new frame handler. */
        if (this.paused) {
            this.emitNextInstruction(strand.firstInstruction);
        }
    };

    /**
     * Starts requestAnimationFrame loop.
     */
    Process.prototype.startEventLoop = function() {
        runtime.control._frame = 0;
        runtime.control._sinceLastTick = 0;

        assert(this.perFrameHandlers.length > 0,
               'Must have at least one per-frame handler defined.');

        /* Alias to handleAnimationFrame, but bound to `this`. */
        this.onAnimationFrame = this.handleAnimationFrame.bind(this);

        if (!this.currentAnimationFrameHandler){
            this.currentAnimationFrameHandler =
                requestAnimationFrame(this.onAnimationFrame);
        }
    };

    /**
     * Cancels all per-frame handlers, and the current
     * `requestAnimationFrame`.
     */
    Process.prototype.clearPerFrameHandlers = function () {
        this.perFrameHandlers = [];
        this.lastTime = new Date().valueOf();
        cancelAnimationFrame(this.currentAnimationFrameHandler);
        this.currentAnimationFrameHandler = null;
    };

    /**
     * Prevents the next callback from running.
     * @private
     */
    Process.prototype.cancelNextTimeout = function cancelNextTimeout() {
        if (this.nextTimeout !== null) {
            cancel(this.nextTimeout);
            this.nextTimeout = null;
        }
    };

    /**
     * Execute `fn` asynchronously. Its execution will happen as soon as
     * possible, but note that it may yield to several other "threads".
     */
    function enqueue(fn, delay) {
        if (delay) {
            return {timeout: setTimeout(fn, delay)};
        } else {
            return {immediate: setImmediate(fn)};
        }
    }

    function cancel(handle) {
        if (handle.immediate) {
            return clearImmediate(handle.immediate);
        } else if (handle.timeout) {
            return clearTimeout(handle.timeout);
        }
        throw new TypeError('Unknown handle.');
    }

    /**
     * Returns true if the argument is a <wb-context> block.
     */
    function isContext(block) {
        return block.isContext;
    }


    /*= Additional Documentation. */

    /**
     * @callback Process~emitter
     * @param {String} name - Event name
     * @param {Object} data - payload
     */

    /**
     * A step or a context block. As of April 2015, this is represented as a
     * custom element defined in `block.js`.
     * @typedef {Object} Frame~Block
     */

    /**
     * A context block. As of April 2015, this is represented as a
     * custom element defined in `block.js`.
     * @typedef {Object} Frame~ContextBlock
     * @see Block
     */

    /**
     * A container of multiple {@link Block blocks}.
     * @typedef {Object} Frame~Container
     */

    /* This is the export of the module. */
    return Process;
}());
