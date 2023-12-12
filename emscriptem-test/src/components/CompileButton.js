import {emscripten} from '@gabrieleroncolato/emception-core';

function CompileButton(){ 

    emscripten();

    const compile = () => {
        console.log('[onClick compile] Hello world!');
    };

    return(
        <button onClick={compile}>
            Compile your code
        </button>
    );

}

export default CompileButton;