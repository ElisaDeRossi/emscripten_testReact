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
}`,

`#include <iostream>
int main(){
    std::string a;
    std::cin >> a;
    std::cout << a << std::endl;
    return 0;
}`, 

`#include <iostream>
#include <emscripten.h>

int main() {
    std::string input = emscripten_run_script_string("prompt('Please enter your name:');");
    std::cout << input << std::endl;
    return 0;
}`
]; 

function WriteAndCompile() {

    /* STYLE */
    const divStyle = {
        display: "flex",
        gap: "10px 20px",
    };
    
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

    const compileButtonStyle = {
        display: "flex",
        gap: "10px 20px",
    };

    const columnStyle = {
        flexDirection: 'column',
    };

    const headerStyle = {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
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
        flexDirection: 'column',
        overflowY: 'auto'
    };

    const paragraphStyle = {
        margin: '5px'
    };

    const [codeString, setCodeString] = useState(defaultPrograms[1]);
    let [output, setOutput] = useState([]);

    const compileAndRun = async () => {

        let initialOutput = [];

        const outputInfo = (message) => {
            
            // Terminal
            initialOutput.push(message);
            setOutput([...initialOutput]);

            // Console
            console.log(message);
        };

        outputInfo("> Initiating emscriptenjs");
        
        const emscriptenjs = new Emscriptenjs();
        await emscriptenjs.init();
        await emscriptenjs.fileSystem.writeFile("/working/main.cpp", codeString);

        // Listen for compilation stdout events
        emscriptenjs.on('compilationStdout', (data) => {
            outputInfo(data);
        });

        // Listen for compilation stderr events
        emscriptenjs.on('compilationStderr', (data) => {
            outputInfo(data);
        });

        // Listen for execution stdout events
        emscriptenjs.on('executionStdout', (data) => {
            outputInfo(data);
        });

        // Listen for execution stderr events
        emscriptenjs.on('executionStderr', (data) => {
            outputInfo(data);
        });

        // Listen for execution stdin events
        // TODO: doesn't work somehow - need to fix
        emscriptenjs.on('executionStdin', (data, def) => {
            /*
            initialOutput.push("> " + message + ": ");
            setOutput([...initialOutput]);
            // originalPrompt(message, def);
            */
            window.prompt('Execution Standard Input:' + data, def);
        });

        outputInfo("> Compiling code");

        const cmd = "em++ -O2 -fexceptions -sEXIT_RUNTIME=1 -sSINGLE_FILE=1 -sMINIFY_HTML=0 -sUSE_CLOSURE_COMPILER=0 main.cpp -o main.js";
        const result = await emscriptenjs.compile(cmd);

        if (result.returncode === 0) {
            outputInfo("> Compilation was successful");
            outputInfo("> OUTPUT: ");
            
            emscriptenjs.execute();
        } else {
            outputInfo("> Compilation failed - code " + result.returncode);
            outputInfo("See console for more information");
        }
    };

    return (
        <div style={divStyle}>
            <div style={columnStyle}>
                <p style={headerStyle}>YOUR CODE:</p>
                <textarea style={textAreaStyle} value={codeString} onChange={e => setCodeString(e.target.value)}>
                    {codeString}
                </textarea>
            </div>
            <div style={compileButtonStyle}>
                <button onClick={compileAndRun}>
                    Compile your code
                </button>
            </div>
            <div style={columnStyle}>
                <p style={headerStyle}>TERMINAL:</p>
                <div style={outputStyle}>
                    {output.map((text, index) => (
                        <p key={index} style={paragraphStyle}>{text}</p>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WriteAndCompile;
