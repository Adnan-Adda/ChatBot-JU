"use client"

import Link from "next/link"
import {FC} from "react"
import {ChatbotUISVG} from "../icons/chatbotui-svg"

interface BrandProps {
    theme?: "dark" | "light"
}


export const Brand: FC<BrandProps> = ({theme = "dark"}) => {

    const handleFocusTextarea = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        const textArea = document.getElementById("textArea");
        if (textArea) {
            textArea.focus();
        }
    };

    return (
        <a
            className="flex cursor-pointer flex-col items-center hover:opacity-50"
            href="#textArea"
            onClick={handleFocusTextarea}
        >
            <div className="mb-2">
                <ChatbotUISVG theme={theme === "dark" ? "dark" : "light"} scale={0.3}/>
            </div>

            <div className="text-4xl font-bold tracking-wide">Chatbot JU</div>
        </a>
    );
};
