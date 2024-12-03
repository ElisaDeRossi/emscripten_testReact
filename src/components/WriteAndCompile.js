import React, { useState } from "react";
import Emscriptenjs from "@emscriptenjs/emscriptenjs"

export const spinner = (size) => `
    <div style="font-size: calc(${size}px / 13)">
        <div style="width: 13em;height: 13em;overflow: hidden;align-items: center;justify-items: center;display: grid;padding: 2em;">
            <style>
                .loader,
                .loader:after {
                    border-radius: 50%;
                    width: 10em;
                    height: 10em;
                }
                .loader {
                    margin: 0;
                    position: relative;
                    text-indent: -9999em;
                    border-top: 1.1em solid rgba(51, 102, 153, 0.2);
                    border-right: 1.1em solid rgba(51, 102, 153, 0.2);
                    border-bottom: 1.1em solid rgba(51, 102, 153, 0.2);
                    border-left: 1.1em solid #336699;
                    -webkit-transform: translateZ(0);
                    -ms-transform: translateZ(0);
                    transform: translateZ(0);
                    -webkit-animation: load8 1.1s infinite linear;
                    animation: load8 1.1s infinite linear;
                }
                @-webkit-keyframes load8 {
                    0% {
                        -webkit-transform: rotate(0deg);
                        transform: rotate(0deg);
                    }
                    100% {
                        -webkit-transform: rotate(360deg);
                        transform: rotate(360deg);
                    }
                }
                @keyframes load8 {
                    0% {
                        -webkit-transform: rotate(0deg);
                        transform: rotate(0deg);
                    }
                    100% {
                        -webkit-transform: rotate(360deg);
                        transform: rotate(360deg);
                    }
                }
            </style>
            <div class="loader"></div>
        </div>
    </div>
`;

export const previewTemplate = (icon, title, message) => `
    <html>
        <head>
            <title>Emscriptenjs output preview</title>
            <style>
                html, body {
                    display: grid;
                    grid-template-rows: 1fr 0;
                    grid-template-columns: 1fr 0;
                    align-items: center;
                    justify-items: center;
                }
                #title,
                #message {
                    font-family: Roboto, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                #icon,
                #title,
                #message {
                    display: grid;
                    align-items: center;
                    justify-items: center;
                }
            </style>
        </head>
        <body>
            <div id="container">
                <h1 id="title">${title}</h1>
                <div id="icon">${icon}</div>
                <div id="message">${message}</div>
            </div>
        </body>
    </html>
`;

const defaultPrograms = [
`#include <iostream>
int main(){
    std::cout << "Hello world" << std::endl;
    return 0;
}`,
`#include <iostream>
#include <string>

int main(){
    std::string name;
    std::cout << "What's your name?" << std::endl;
    std::cin >> name;
    std::cout << name << std::endl;
    return 0;
}`,
`#include <iostream>

double calculateArea(double length, double width) {
    return length * width;
}

double calculatePerimeter(double length, double width) {
    return 2 * (length + width);
}

int main() {
    double length = 5.0;
    double width = 3.0;

    double area = calculateArea(length, width);
    double perimeter = calculatePerimeter(length, width);

    std::cout << "Length: " << length << std::endl;
    std::cout << "Width: " << width << std::endl;
    std::cout << "Area: " << area << std::endl;
    std::cout << "Perimeter: " << perimeter << std::endl;

    return 0;
}`
]

function WriteAndCompile() {

    /* STYLE */
    const textAreaStyle = {
        backgroundColor: '#2d2d2d',
        border: '1px solid #444',
        borderRadius: '5px',
        width: '500px',
        color: '#ffffff',
        fontFamily: "'Courier New', Courier, monospace",
        display: 'flex',
        height: '500px',
        padding: '20px', 
    };

    const divStyle={
        display: "flex",
        gap    : "10px 20px",
    };

    const outputStyle = {
        backgroundColor: '#2d2d2d',
        border: '1px solid #444',
        borderRadius: '5px',
        width: '500px',
        color: '#ffffff',
        fontFamily: "'Courier New', Courier, monospace",
        display: 'flex',
        height: '500px',
        padding: '20px',
        flexDirection: 'column' 
    };

    const paragraphStyle = {
        margin: '5px'
    };

    const [codeString, setCodeString] = useState(defaultPrograms[2]);
    let [output, setOutput] = useState([]);
    
    const compile = async () => {
        const emscriptenjs = new Emscriptenjs();
        await emscriptenjs.init();
        await emscriptenjs.fileSystem.writeFile("/working/main.cpp", codeString);
        
        console.log("Compiling code");
        const cmd = "em++ -O2 -fexceptions -sEXIT_RUNTIME=1 -sSINGLE_FILE=1 -sMINIFY_HTML=0 -sUSE_CLOSURE_COMPILER=0 main.cpp -o main.js";
        const result = await emscriptenjs.run(cmd);

        
        if (result.returncode === 0) {
            console.log("Compilation was successful");
            const content = await emscriptenjs.fileSystem.readFile("/working/main.js", { encoding: "utf8" });

            const funct = new Function(content);

            // Override console.log function
            const originalLog = console.log;
            output = [];
            console.log = (message) => {
                output.push(message); 
                setOutput(output);
            };

            // TODO: Override window.prompt function
            /*
            const originalPrompt = window.prompt;
            window.prompt = (message, defaultInput) => {
                originalLog("aaaaaaaaaaaaaaaaaa");
                // return originalPrompt(message, defaultInput);
            };
            */

            funct();

            // Reassign functions
            console.log = originalLog;
            // window.prompt = originalPrompt;
        } else {
            alert("Compilation failed");
        }
    };

    return (
        <div style={divStyle}>
            <div style={divStyle}>
                <textarea style={textAreaStyle} value={codeString} onChange={e => setCodeString(e.target.value)}>
                    {codeString}
                </textarea>
            </div>
            <div style={divStyle}>
                <button onClick={compile}>
                    Compile your code
                </button>
            </div>
            <div style={outputStyle}>
                {output.map((text, index) => (
                    <p key={index} style={paragraphStyle}>{text}</p>
                ))}
            </div>
        </div>
    );
}

export default WriteAndCompile;
