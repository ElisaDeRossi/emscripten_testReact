import React, {useState} from "react";
import Emception from "@gabrieleroncolato/emception-core/src/index.js" 

function WriteAndCompile(){

    /* STYLE */
    const textAreaStyle = {
        height: "500px",
        width: "500px"
    };

    const [codeString,setCodeString] = useState("#include <iostream>\n int main(){\n\tstd::cout << 'Hello world' << std::endl;\n\treturn 0;\n}\n");

    const compile = async () => {
        const emception = new Emception();
        console.log(emception)
        await emception.init();
        await emception.fileSystem.writeFile("/working/main.cpp", codeString);
        const cmd = "em++ -O2 -fexceptions --proxy-to-worker -sEXIT_RUNTIME=1 -sSINGLE_FILE=1 -sMINIFY_HTML=0 -sUSE_CLOSURE_COMPILER=0 main.cpp -o main.html";
        const result = await emception.run(cmd);
        console.log(result);
    };
    
    return(
        <div>
            <div>
                <textarea style={textAreaStyle} value={codeString} onChange={ e => setCodeString(e.target.value)}>
                    {codeString}
                </textarea>
            </div>
            <div>
                <button onClick={compile}>
                    Compile your code
                </button>
            </div>
        </div>
    );

}

export default WriteAndCompile;