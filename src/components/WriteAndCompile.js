import React, { useState } from "react";
import Emscriptenjs from "@emscriptenjs/emscriptenjs"

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

    const [codeString, setCodeString] = useState(defaultPrograms[1]);
    let [output, setOutput] = useState([]);

    const compile = async () => {

        let initialOutput = [];
        
        // Override prompt function
        /* TODO: doesn't work for some reason
        const originalPrompt = window.prompt;
        window.prompt = (message, def) => {
            initialOutput.push("> " + message + ": ");
            setOutput([...initialOutput]);
            // originalPrompt(message, def);
        };
        */

        // Override console.log function
        const originalLog = console.log;
        console.log = (message) => {
            initialOutput.push(message); 
            setOutput([...initialOutput]);
        };

        console.log("> Initiating emscriptenjs");
        const emscriptenjs = new Emscriptenjs();
        await emscriptenjs.init();
        await emscriptenjs.fileSystem.writeFile("/working/main.cpp", codeString);
        
        console.log("> Compiling code");
        const cmd = "em++ -O2 -fexceptions -sEXIT_RUNTIME=1 -sSINGLE_FILE=1 -sMINIFY_HTML=0 -sUSE_CLOSURE_COMPILER=0 main.cpp -o main.js";
        const result = await emscriptenjs.run(cmd);
        
        if (result.returncode === 0) {
            console.log("> Compilation was successful");
            console.log("> OUTPUT: ");

            const content = await emscriptenjs.fileSystem.readFile("/working/main.js", { encoding: "utf8" });
            // eslint-disable-next-line
            const funct = new Function(content);

            funct();
        } else {
            alert("Compilation failed");
        }

        // Reassign functions
        console.log = originalLog;
        // window.prompt = originalPrompt;
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
