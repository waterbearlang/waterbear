100 - ((sin((idx * 60) + (FRAME * (sin(FRAME) * 10))) * 25) + (sin(FRAME) * 50))

on start
    fill color
    stroke color
    
every 30 seconds
    clear rect
    with context
        translate to mid x mid y
        for i in 60
            rotate 6
            with context
                translate
                    minus
                        100
                        plus
                            plus
                                sin
                                    times
                                        IDX
                                        60
                                times
                                    times
                                        FRAME
                                        times
                                            sin
                                                FRAME
                                            10
                                    25
                            times
                                sin
                                    FRAME
                                50
                            
