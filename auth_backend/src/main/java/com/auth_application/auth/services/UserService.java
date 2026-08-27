package com.auth_application.auth.services;

import com.auth_application.auth.payload.UserDto;

public interface UserService {
    //create user
    UserDto createUser(UserDto userDto);

    //update user
    UserDto updateUser(UserDto userDto,String userId);

    //get user by email
    UserDto getUserByEmail(String emailId);

    //delete user
    void deleteUser(String userId);

    //get user by user id
    UserDto getUserById(String userId);

    //get all users
    Iterable<UserDto> getAllUsers();


}
