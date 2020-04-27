package com.claro.cc.service.impl;

import java.util.List;
import java.util.ArrayList;

import com.claro.cc.domain.Address;
import com.claro.cc.domain.Person;
import com.claro.cc.domain.PersonContact;
import com.claro.cc.domain.User;
import com.claro.cc.repository.AddressRepository;
import com.claro.cc.repository.PersonContactRepository;
import com.claro.cc.repository.PersonRepository;
import com.claro.cc.repository.UserRepository;
import com.claro.cc.service.PersonInfoService;
import com.claro.cc.service.dto.PersonFullDTO;
import com.claro.cc.service.mapper.PersonContactMapper;
import com.claro.cc.service.mapper.PersonFullMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PersonInfoServiceImpl implements PersonInfoService {

    @Autowired
    PersonFullMapper personFullMapper;

    @Autowired
    PersonContactMapper personContactMapper;

    @Autowired
    PersonRepository personRepository;

    @Autowired
    AddressRepository addressRepository;

    @Autowired
    PersonContactRepository personContactRepository;

    @Autowired
    UserRepository userRepository;

    @Override
    public PersonFullDTO save(PersonFullDTO personFullDTO) {
        final Person person = personFullMapper.personFullDTOToPerson(personFullDTO);
        
        
        User user = userRepository.findById(personFullDTO.getUserId()).get();
        person.setUser(user);
        personRepository.save(person);
        person.getAddresses().forEach(add -> add.setPerson(person));
        person.getPersonContacts().forEach(con -> con.setPerson(person));
        
        //personContactRepository.saveAll()
        personContactRepository.saveAll(person.getPersonContacts());
        addressRepository.saveAll(person.getAddresses());
        
        return personFullMapper.personToPersonFullDTO(personRepository.save(person));
    }
}
