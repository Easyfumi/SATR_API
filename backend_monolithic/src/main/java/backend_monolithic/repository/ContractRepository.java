package backend_monolithic.repository;

import backend_monolithic.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    Optional<Contract> findByNumber(String number);
    boolean existsByNumber(String number);
}
