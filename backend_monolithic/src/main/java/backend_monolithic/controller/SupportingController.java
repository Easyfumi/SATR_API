package backend_monolithic.controller;


import backend_monolithic.model.Contract;
import backend_monolithic.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import backend_monolithic.model.Applicant;
import backend_monolithic.model.Manufacturer;
import backend_monolithic.model.Representative;
import backend_monolithic.repository.ApplicantRepository;
import backend_monolithic.repository.ManufacturerRepository;
import backend_monolithic.repository.RepresentativeRepository;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SupportingController {

    private final ApplicantRepository applicantRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final RepresentativeRepository representativeRepository;


    @GetMapping("/applicants/search")
    public List<Applicant> searchApplicants(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return applicantRepository.findByNameContainingIgnoreCase(search);
        }
        return applicantRepository.findAll();
    }

    @GetMapping("/manufacturers/search")
    public List<Manufacturer> searchManufacturers(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return manufacturerRepository.findByNameContainingIgnoreCase(search);
        }
        return manufacturerRepository.findAll();
    }

    @GetMapping("/representatives/search")
    public List<Representative> searchRepresentatives(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return representativeRepository.findByNameContainingIgnoreCase(search);
        }
        return representativeRepository.findAll();
    }

}
