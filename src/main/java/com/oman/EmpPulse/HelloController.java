package com.oman.EmpPulse;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;

@RestController
public class HelloController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/")
    public String hello() {
        return "Hello, EmpPulse!";
    }

    @GetMapping("/db-check")
public String checkDb() {
    try {
        // Запрос к системной таблице PostgreSQL для получения списка всех созданных пользователем таблиц
        String sql = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'";
        
        List<String> tables = jdbcTemplate.queryForList(sql, String.class);

        if (tables.isEmpty()) {
            return "Соединение есть, но таблиц в схеме 'public' пока нет. Проверьте логи Flyway.";
        }

        return "База готова! Список созданных таблиц: " + String.join(", ", tables);
    } catch (Exception e) {
        return "Ошибка подключения к БД или выполнения запроса: " + e.getMessage();
    }
}

    @GetMapping("/set-session")
    public String setSession(HttpSession session) {
        session.setAttribute("ID", "Nazar");
        return "Имя Nazar сохранено в сессию (в БД)!";
    }

    @GetMapping("/get-session")
    public String getSession(HttpSession session) {
        String user = (String) session.getAttribute("ID");
        return user != null ? "Привет из сессии, " + user : "Сессия пуста.";
    }
}