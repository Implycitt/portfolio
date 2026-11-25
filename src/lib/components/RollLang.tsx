"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ReactNode, useEffect, useState } from "react";

const hello = ["Quentin Bordelon", "Hello!", "Bonjour!", "Hola!", "Hallo!", "Ciao!", "Olá!", "こんにちは"];
const hold = 3000;
const roll = 0.5;
const ease = [0.338, 0.015, 0.395, 0.959] as const;

export default function RollLang(): ReactNode {
    const reduceMotion = useReducedMotion();
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const id = setTimeout(() => setIndex(i => (i + 1) % hello.length), hold);
        return () => clearTimeout(id);
    }, [index]);

    return (
        <span className="relative inline-grid overflow-hidden leading-tight">
            {hello.map(word => (
                <span key={word} aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-nowrap">
                    {word}
                </span>
            ))}

            <AnimatePresence initial={false}>
                <motion.span
                    key={index}
                    className="col-start-1 row-start-1 whitespace-nowrap text-center w-full max-w-full bg-linear-to-r from-rose via-love to-foam bg-size-[200%_200%] animate-shift bg-clip-text p-4 text-4xl font-extrabold text-transparent sm:p-8 sm:text-5xl"
                    initial={{ y: reduceMotion ? 0 : "-100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: reduceMotion ? 0 : "100%" }}
                    transition={{ duration: reduceMotion ? 0 : roll, ease: ease }}
                >
                    {hello[index]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}
