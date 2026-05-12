package com.oman.EmpPulse.config;

import com.oman.EmpPulse.entity.User;
import com.oman.EmpPulse.entity.UserRole;
import com.oman.EmpPulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AppStartupRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.owner.email}")
    private String ownerEmail;

    @Value("${app.owner.password}")
    private String ownerPassword;

    public AppStartupRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail(ownerEmail).isEmpty()) {
            User owner = new User();
            owner.setName("System");
            owner.setSurname("Owner");
            owner.setEmail(ownerEmail);
            owner.setPassHash(passwordEncoder.encode(ownerPassword));
            owner.setTheme("LIGHT");
            owner.setLanguage("ENG");
            owner.setRole(UserRole.OWNER);
            userRepository.save(owner);
            System.out.println("Owner account seeded successfully.");
        }
    }
}
