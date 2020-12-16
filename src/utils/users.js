const users = [];

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, userName, room }) => {
    //Clean the data
    userName = userName.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Validate the data
    if(!userName || !room){
        return {
            error: 'User name and room are required'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.userName === userName
    })

    if(existingUser){
        return {
            error: 'Username is in use'
        }
    }

    const user = {id, userName, room}
    users.push(user)
    return {user} 
}

const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room)
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}

module.exports = {
    addUser, getUser, getUsersInRoom, removeUser
}