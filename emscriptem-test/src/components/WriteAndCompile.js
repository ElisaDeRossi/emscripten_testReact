import React, { useState } from "react";
import Emception from "@gabrieleroncolato/emception-core/src/index.js"

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
            <title>Emception output preview</title>
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
}`
]

function WriteAndCompile() {

    /* STYLE */
    const textAreaStyle = {
        height: "500px",
        width: "500px"
    };

    const divStyle={
        display: "flex",
        gap    : "10px 20px",
    };

    const iframeStyle = {
        width : "600px"
    };

    const [codeString, setCodeString] = useState(defaultPrograms[1]);
    const [srcURL, setsrcURL] = useState("");

    let url="";    
    const preview = (content) =>{
        if (url) URL.revokeObjectURL(url);
        url = URL.createObjectURL(new Blob([content], { type: 'text/html' }));
        setsrcURL(url)
    }
    
    const compile = async () => {
        preview(previewTemplate(spinner(80), "Compiling", ""));
        const emception = new Emception();
        await emception.init();
        await emception.fileSystem.writeFile("/working/main.cpp", codeString);
        const cmd = "em++ -O2 -fexceptions -sEXIT_RUNTIME=1 -sSINGLE_FILE=1 -sMINIFY_HTML=0 -sUSE_CLOSURE_COMPILER=0 main.cpp -o main.html";
        const result = await emception.run(cmd);
        if (result.returncode === 0) {
            const content = await emception.fileSystem.readFile("/working/main.html", { encoding: "utf8" });
            preview(content);
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
            <div style={divStyle}>
                <iframe title="stdout" style={iframeStyle} src={srcURL}></iframe>
            </div>
        </div>
    );

}

export default WriteAndCompile;