const spawn = require('child_process').spawn;

function getPrompts(filePath,text){
    const process = spawn("python", [
        filePath,
        ['--text',text].join('=')
      ]);

    process.stdout.on('data', function(data) {
      console.log('python output:',data.toString('utf8'))
    }) 
}

getPrompts('./../prompter/get_prompt.py',"The autumn breeze swept the leave across the tarmac.");