function Welcome(name: string ) : string {
    return `Welcome, ${name}!`;
}

console.log(Welcome("User"));


const user = {
    name : "Usman",
    age: 25,
    emplloyed: true
}

const userName = user.name;
console.log(`User Name is : ${userName}`);