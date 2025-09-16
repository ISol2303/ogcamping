package com.mytech.backend.portal.apis;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mytech.backend.portal.dto.GeneratedBlog;
import com.mytech.backend.portal.services.impl.OpenAIServiceImpl;

@RestController
@RequestMapping("/api/openai")
public class OpenAIController {

    private final OpenAIServiceImpl openAIService;

    public OpenAIController(OpenAIServiceImpl openAIService) {
        this.openAIService = openAIService;
    }

    @PostMapping("/text")
    public ResponseEntity<GeneratedBlog> generateText(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        if (prompt == null || prompt.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        GeneratedBlog result = openAIService.callOpenAIForText(prompt);
        return ResponseEntity.ok(result);
    }
}
