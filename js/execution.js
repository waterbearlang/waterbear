/**
 * Abstracts the execution state. That is, all the stuff required for running
 * blocks. It goes in here!
 *
 * The exported class `Process` is kind of similar to a Unix process in that
 * there is one shared memory, but it contains a bunch of "threads" that may
 * run concurrently.
 *
 * @author Eddie Antonio Santos @eddieantonio
 * Date:   March 2015
 */
window.WaterbearProcess = (function () {
    'use strict';

    var assert = console.assert.bind(console);

    /**
     * An execution context! Think of it as a thread: it keeps track of the
     * current scope (thus, "the stack")
     **/
    function Context(instruction, scope) {
        this.instructionPointer = instruction;
        this.scope = scope;
    }

    Context.prototype.next = function next() {
        /* TODO: Get the next instruction IN THIS CONTEXT! */
    };


    /**
     * Encapsulates the execution of a Waterbear program. There may be several
     * "threads", so this encompasses all of them. ALL OF THEM.
     */
    function Process() {
        var started = false;

        /* Set some essential state. */
        this.contexts = [];
        this.currentContext = null;
        /* Disable breakpoints. */
        this.shouldBreak = false;
        /* Run as quickly as possible. */
        this.rate = 0;

        Object.defineProperties(this, {
            /* `started` is trapped in this closure, thus it can only be
             * changed in this constructor, or any function defined within this
             * constructor. */
            started: {
                get: function () { return started; },
                enumerable: true
            },
            /* There's no going back once this function gets called! */
            setStarted: {
                value: function () { started = true; },
                enumerable: false
            }
        });
    }

    /**
     * Starts (asynchronous!) execution from scratch. Can only be called once.
     */
    Process.prototype.start = function start(firstInstrction) {
        assert(!this.started, 'Waterbear already started!');
        this.setStarted();

        /* TODO: Create a new context and start asynchronous execution. */
        return this;
    };

    /**
     * Requests execution to pause before the next instruction.
     */
    Process.prototype.pause = function disableBreakpoints() {
        assert(this.started);
        /* TODO: */
        return this;
    };

    /**
     * Sets rate of execution in instructions per second.
     * If rate is not provided or underfined, the rate is unlimited.
     */
    Process.prototype.setRate = function setRate(rate) {
        if (rate === undefined) {
            this.rate = 0;
        } else {
            this.rate = +rate;
        }
        return this;
    };

    /**
     * Requests execution to stop.
     */
    Process.prototype.pause = function disableBreakpoints() {
        assert(this.started);
        /* TODO: */
        return this;
    };

    /**
     * Reqests to cleanly terminates the current process.
     * Once this has happened, this process should no longer be used.
     * `cb` is called once the process has cleanly terminated.
     */
    Process.prototype.terminate = function terminate(cb) {
        assert(this.started);
        /* TODO: */
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



    /**
     * Execute `fn` asynchronously. Its execution will happen as soon as
     * possible, but note that it may yield to several other "threads".
     */
    function enque(fn) {
        return setTimeout(fn, 0);
    }


    /* This is the export of the module. */
    return Process;
}());
