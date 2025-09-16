package com.mytech.backend.portal.services.impl;

import java.util.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytech.backend.portal.dto.GeneratedBlog;
import com.mytech.backend.portal.models.Blog;
import com.mytech.backend.portal.models.Location;
import com.mytech.backend.portal.services.AIService;

@Service

public class OpenAIServiceImpl implements AIService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${openai.api.key:}")
    private String openAiApiKey;

    // Endpoint — thay đổi nếu cần (Responses API / Chat Completions)
    private static final String OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

    @Override
    public GeneratedBlog generateFromBlog(Blog blog) {
        String prompt = buildPromptFromBlog(blog);
        return callOpenAIAndParse(prompt);
    }

    @Override
    public GeneratedBlog generateFromLocation(Location location) {
        String prompt = buildPromptFromLocation(location);
        return callOpenAIAndParse(prompt);
    }

    private String buildPromptFromBlog(Blog blog) {
        String title = blog.getTitle() != null ? blog.getTitle() : "Bài viết";
        String loc = (blog.getLocation() != null && blog.getLocation().getName() != null) ? blog.getLocation().getName() : "một địa điểm";
        String contentHint = blog.getContent() != null ? blog.getContent() : "";

        // Yêu cầu AI trả về JSON
        String userPrompt = String.join("\n",
            "You are a helpful blogging assistant. Create a full blog based on the information below.",
            "Return your response in JSON ONLY with fields: title (string), summary (string, 100-150 words), content (string, full article, use paragraphs), keywords (array of strings), thumbnailUrl (string or null), imageUrl (string or null).",
            "Do not include any additional text outside the JSON.",
            "",
            "Input:",
            "Title: " + title,
            "Location: " + loc,
            "ContentHint: " + contentHint,
            "",
            "Make the article friendly, informative and include suggestions, activities, and a short call-to-action at the end."
        );
        return userPrompt;
    }

    private String buildPromptFromLocation(Location location) {
        String loc = (location != null && location.getName() != null) ? location.getName() : "một địa điểm";
        String userPrompt = String.join("\n",
            "You are a helpful blogging assistant. Create a full blog about the location provided.",
            "Return your response in JSON ONLY with fields: title (string), summary (string, 100-150 words), content (string, full article, use paragraphs), keywords (array of strings), thumbnailUrl (string or null), imageUrl (string or null).",
            "Do not include any additional text outside the JSON.",
            "",
            "Location: " + loc,
            "Include top attractions, suggested itinerary for 2-3 days, tips, and CTA."
        );
        return userPrompt;
    }

    private GeneratedBlog callOpenAIAndParse(String prompt) {
        GeneratedBlog result = new GeneratedBlog();

        if (openAiApiKey == null || openAiApiKey.trim().isEmpty()) {
            // Nếu chưa cấu hình API key
            result.setTitle("AI Suggestion Title");
            result.setSummary("AI không chạy vì chưa cấu hình OPENAI_API_KEY.");
            result.setContent("AI chưa được cấu hình. Fallback content.");
            result.setKeywords(Arrays.asList("ai", "not-configured"));
            return result;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);

            Map<String, Object> messageSystem = Map.of("role", "system", "content", "You are a helpful blog writer.");
            Map<String, Object> messageUser = Map.of("role", "user", "content", prompt);
            List<Map<String, Object>> messages = Arrays.asList(messageSystem, messageUser);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "gpt-4o-mini"); 
            body.put("messages", messages);
            body.put("temperature", 0.8);
            body.put("max_tokens", 1200);

            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);
            ResponseEntity<String> response = restTemplate.postForEntity(OPENAI_CHAT_URL, request, String.class);

            if (response.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                // Quota hết
                result.setTitle("AI Quota Exceeded");
                result.setSummary("AI không thể tạo bài vì vượt hạn mức API. Vui lòng thử lại sau hoặc kiểm tra billing.");
                result.setContent("AI không tạo được bài do quota hết. Bạn vẫn có thể chỉnh sửa thủ công.");
                result.setKeywords(Arrays.asList("ai", "quota-exceeded"));
                return result;
            }

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                result.setTitle("AI fallback title");
                result.setSummary("AI fallback summary do lỗi response.");
                result.setContent("AI fallback content.");
                result.setKeywords(Arrays.asList("fallback"));
                return result;
            }

            // Parse JSON từ OpenAI
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                JsonNode message = choices.get(0).path("message");
                String content = message.path("content").asText();

                String jsonPart = extractJson(content);
                if (jsonPart != null) {
                    JsonNode parsed = objectMapper.readTree(jsonPart);
                    result.setTitle(parsed.path("title").asText(null));
                    result.setSummary(parsed.path("summary").asText(null));
                    result.setContent(parsed.path("content").asText(null));

                    JsonNode kwNode = parsed.path("keywords");
                    if (kwNode.isArray()) {
                        List<String> kws = new ArrayList<>();
                        for (JsonNode k : kwNode) kws.add(k.asText());
                        result.setKeywords(kws);
                    } else if (kwNode.isTextual()) {
                        result.setKeywords(Arrays.asList(kwNode.asText().split(",")));
                    }

                    result.setThumbnailUrl(parsed.path("thumbnailUrl").asText(null));
                    result.setImageUrl(parsed.path("imageUrl").asText(null));
                    return result;
                } else {
                    result.setContent(content);
                    result.setTitle(null);
                    result.setSummary(null);
                    result.setKeywords(Arrays.asList());
                    return result;
                }
            } else {
                result.setTitle("No choices from AI");
                result.setSummary("");
                result.setContent("");
                result.setKeywords(Arrays.asList());
                return result;
            }

        } catch (Exception ex) {
            // Fallback khi có exception
            result.setTitle("AI Error");
            result.setSummary("AI generation error: " + ex.getMessage());
            result.setContent("AI generation error: " + ex.getMessage());
            result.setKeywords(Arrays.asList("error"));
            return result;
        }
    }


    // Try to find first JSON object in a string
    private String extractJson(String s) {
        if (s == null) return null;
        int first = s.indexOf("{");
        int last = s.lastIndexOf("}");
        if (first >= 0 && last > first) {
            return s.substring(first, last + 1);
        }
        return null;
    }

	public GeneratedBlog callOpenAIForText(String prompt) {
		return callOpenAIAndParse(prompt); // reuse existing logic
	}
}
