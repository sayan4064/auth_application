package com.auth_application.services.impl;

import com.auth_application.dtos.UserDto;
import com.auth_application.entity.Provider;
import com.auth_application.entity.User;
import com.auth_application.exception.ResoureceNotFoundException;
import com.auth_application.helper.UserHelper;
import com.auth_application.repository.UserRepo;
import com.auth_application.services.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepo  userRepo;
    private final ModelMapper modelMapper;
    //create user
    @Override
    @Transactional
    public UserDto createUser(UserDto userDto) {
         if(userDto.getEmail()==null || userDto.getEmail().isBlank()) {
             throw new IllegalArgumentException("Email is required");
         }
         if(userRepo.findByEmail(userDto.getEmail()).isPresent()) {
             throw new IllegalArgumentException("User already exists");
         }

         User user = modelMapper.map(userDto, User.class);
         user.setProvider(userDto.getProvider()!=null ? userDto.getProvider() : Provider.LOCAL);

         User savedUser = userRepo.save(user);
         return modelMapper.map(savedUser, UserDto.class);
    }

    @Override
    @Transactional
    public UserDto updateUser(UserDto userDto, String userId) {
       var uuid = UserHelper.parseUUID(userId);
        User existingUser=userRepo.findById(uuid)
                .orElseThrow(() -> new ResoureceNotFoundException("User not found"));

        //update name
        if(userDto.getName()!=null){
            existingUser.setName(userDto.getName());
        }

        //update image
        if(userDto.getImage()!=null){
            existingUser.setImage(userDto.getImage());
        }

        //update password
        if(userDto.getPassword()!=null){
            existingUser.setPassword(userDto.getPassword());
        }

        //update provider
        if(userDto.getProvider()!=null){
            existingUser.setProvider(userDto.getProvider());
        }

        //update enable
        existingUser.setEnable(userDto.isEnable());

        User updatedUser = userRepo.save(existingUser);

        return modelMapper.map(
                updatedUser,
                UserDto.class
        );

    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String emailId) {
        User user=userRepo.findByEmail(emailId)
                .orElseThrow(() -> new ResoureceNotFoundException("User not found"));
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    @Transactional
    public void deleteUser(String userId) {
    var uuid=UserHelper.parseUUID(userId);
        User user=userRepo.findById(uuid)
                .orElseThrow(() -> new ResoureceNotFoundException("User not found"));
        userRepo.delete(user);
    } 

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(String userId) {
        var uuid= UserHelper.parseUUID(userId);
        User user=userRepo.findById(uuid)
                .orElseThrow(() -> new ResoureceNotFoundException("User not found"));
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    @Transactional
    public Iterable<UserDto> getAllUsers() {
      return userRepo.findAll()
              .stream()
              .map(user -> modelMapper.map(user, UserDto.class))
              .toList();
    }
}
