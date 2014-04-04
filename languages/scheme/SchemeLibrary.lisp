(define (length lst n)
	(if (equal? lst '())
		n
		(length (cdr lst) (+ n 1))
	)
)


(define (listTraversal lst)
(if (equal? () lst)
'()
(cons (car lst)
	(listTraversal (cdr lst)))
	))

(define (listRev lst)
	(letrec (helper (lambda x))

	)
	(listRevHelper lst ()))

(define (listRevHelper lst acc)
	(if (equal? () lst)
		acc
		(listRevHelper (cdr lst) (cons (car lst) acc)

		)

	)
)

(define (map f lst)
	(if (equal? () lst)
		'()
		(cons (f (car lst))
			(map f (cdr lst))
			)
	)
)

(define (rev_map_helper f lst acc)
	(if (equal? lst ())
		acc
		(rev_map_helper f (cdr lst) (cons (f (car lst)) acc))
	)
)

(define (rev_map f lst)
	(rev_map_helper f lst ())
)

(define (factorial n)
	(if (zero? n) 1
		(* n (factorial (- n 1)))))

(define (tail_rec_factorial n)
	(fact_helper n 1)
)

(define (fact_helper n acc)
	(if (zero? n)
		acc
		(fact_helper (- n 1) (* n acc))
		)
)

(define (fibonacci n)
     (if (< n 2) n
         (+ (fibonacci (- n 1))
            (fibonacci (- n 2)))))

(define (dynamic_fib n)
	(fib_helper n 0 1)
)

(define (fib_helper n prev1 prev2)
	(if (equal? n 2) 
			(+ prev1 prev2)
			(fib_helper (- n 1) prev2 (+ prev2 prev1))
			)
		)
)

(define (fold_left f acc lst)
	(if (equal? lst ())
		acc
		(fold_left f (f acc (car lst)) (cdr lst))
		)
)

(define (fold_right f lst acc)
	(if (equal? lst ())
		acc
		(fold_right f (cdr lst) (f (car lst) acc))
	)
)

(define (treeInsert tree item)
	(if (equal? (cdr tree) ())

	)
)

(define (treeDelete tree item)

)

(define (lstTreeHelper lst tree)
	(if (equals? lst ())
		tree
		(lstTreeHelper (cdr lst) (treeInsert tree (car lst)))
	)
)

(define (listToTree lst)
	(fold_left treeInsert (list car lst) (cdr lst))
)

(define (binarySearch tree item)
	(if (equal? (cdr tree) ()) 
		(equal? item  (car tree))
		(if (> (cadr tree))
			(binarySearch (car tree) item)
			(if (< cadr tree)
				(binarySearch (caddr tree) item)
				#t
			)
		)

		)
	)