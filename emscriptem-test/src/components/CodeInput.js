function CodeInput(){

    const textAreaStyle = {
        height: "500px",
        width: "500px"
    };
    
    const helloWorld = "#include <iostream>\n int main(){\n\tstd::cout << 'Hello world' << std::endl;\n\treturn 0;\n}\n";
    
    return(
        <textarea style={textAreaStyle}>
            {helloWorld}
        </textarea>
    );
}

export default CodeInput;