import pb from "@/lib/pb";

//gets the list of users
async function fetchUsersList() {
    // fetch a paginated records list
    const resultList = await pb.collection('users').getList(1, 50, {
        filter: 'someField1 != someField2'
    });

    // you can also fetch all records at once via getFullList
    const records = await pb.collection('users').getFullList({
        sort: '-someField',
    });

    // or fetch only the first record that matches the specified filter
    const record = await pb.collection('users').getFirstListItem('someField="test"', {
        expand: 'relField1,relField2.subRelField',
    });

    return {
        resultList,
        records,
        record,
    };

}

//gets the view of single record
async function getView() {
    const record = await pb.collection('users').getOne('recordId', {
        expand: 'relField1,relField2.subRelField',
    })

    return record;
}

//creates a new user
async function createUser() {
    const userData = {

    }

    const createRecord = await pb.collection('users').create(userData);

    return createRecord;
}

//updates the details of an exisitng user
async function updateUser() {
    const updateUserData = {

    }

    const updateRecord = await pb.collection('users').create(updateUserData);

    return updateRecord;
}

//deletes a user via user ID?
async function deleteUser() {
    await pb.collection('users').delete('recordId');
}

