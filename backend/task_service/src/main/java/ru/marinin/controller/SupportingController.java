package ru.marinin.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.marinin.model.Applicant;
import ru.marinin.model.Manufacturer;
import ru.marinin.model.Representative;
import ru.marinin.repository.ApplicantRepository;
import ru.marinin.repository.ManufacturerRepository;
import ru.marinin.repository.RepresentativeRepository;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SupportingController {

    private final ApplicantRepository applicantRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final RepresentativeRepository representativeRepository;


    @GetMapping("/applicants/search")
    public List<Applicant> searchApplicants(@RequestParam String name) {
        return applicantRepository.findByNameContainingIgnoreCase(name);
    }

    @GetMapping("/manufacturers/search")
    public List<Manufacturer> searchManufacturers(@RequestParam String name) {
        return manufacturerRepository.findByNameContainingIgnoreCase(name);
    }

    @GetMapping("/representatives/search")
    public List<Representative> searchRepresentatives(@RequestParam String name) {
        return representativeRepository.findByNameContainingIgnoreCase(name);
    }
}
