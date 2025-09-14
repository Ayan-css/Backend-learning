const { log } = require('console')
const fs = require('fs')
const FilePath = './tasks.json'

const loadTasks= () => { 
    try {
     const dataBuffer = fs.readFileSync(FilePath);
     const dataJSON = dataBuffer.toString();
    return JSON.parse(dataJSON);
    } catch (error) {
        return[]
    }
 }

const saveTasks = (tasks) => {
    const dataJSON = JSON.stringify(tasks)
    fs.writeFileSync(FilePath, dataJSON)
}

const addTask = (task) => { 
    const tasks  = loadTasks();
    tasks.push({task});
    saveTasks(tasks);
    console.log("Tasks Added", task);

 }

const removeTask = (index) =>{
            const tasks = loadTasks();
            if(isNaN(index)|| index < 1 ||index > tasks.length){
                console.log('invalid task number');
                return;
                
            }
            const removedTask = tasks.splice(index - 1,1)
            saveTasks(tasks);
            console.log(`Task removed: ${removedTask[0].task}`);
            
}

 const listTask = () => { 
    const tasks = loadTasks()
    tasks.forEach((task, index) => {
        console.log(`${index + 1} - ${task.task}`);
        
    });
  }

const command = process.argv[2]
const argument = process.argv[3]

if(command === 'add'){
    addTask(argument)
}else if(command === 'list'){
    listTask()
}else if(command === 'remove'){
    removeTask(parseInt(argument))
}else {
    console.log("command not found");
    
}