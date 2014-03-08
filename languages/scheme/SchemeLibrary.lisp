(define x 5)

(define sum (lambda x y) (+ x y))

(define (sum1 x) (+ x 1))

(define (greaterThan5 x) (if (> x 5) #t #f))

(define (mergeSort l))

(define (merge l1 l2))

(define (listTraversal lst)
(if (equal? () lst)
'()
(cons (car lst)
	(listTraversal (cdr lst)))
	))

(define (listRev lst)

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

(define (merge lst1 lst2 acc)
	(if (equal? () lst1)
		(append acc lst2)
		(if (equal? lst2 ())
			(append acc lst2)
			(let [ge  
		)
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