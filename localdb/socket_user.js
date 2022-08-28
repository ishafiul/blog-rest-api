const users = [];

const addUser = ({id, name}) => {
    name = name.trim().toLowerCase();
    const existingUser = users.find(user => {
        return user.name === name
    });

    if(existingUser) {
        return{error: "Username is taken"};
    }
    const user = {id,name};

    users.push(user);
    return {user};

}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    });
    if(index) {
        return users.splice(index,1)[0];
    }
}

const getUsers = ()=>{
    return users;
}

const getUser = (id) => {
    const isFound = users.find((user) => {
        return user.id === id
    });
    if(isFound){
        return isFound;
    }
}

const getUsersInRoom = (room) => users
    .filter((user) => user.room === room);

module.exports = {addUser, removeUser,
    getUser, getUsersInRoom,getUsers};