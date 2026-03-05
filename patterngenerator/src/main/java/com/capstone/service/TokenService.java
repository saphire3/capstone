package com.capstone.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenService {
    private final Map<String, Integer> tokenToUserId = new ConcurrentHashMap<>();

    public String issueToken(Integer userId) {
        String token = UUID.randomUUID().toString();
        tokenToUserId.put(token, userId);
        return token;
    }

    public Integer getUserIdFromToken(String token) {
        return tokenToUserId.get(token);
    }

    public void revoke(String token) {
        tokenToUserId.remove(token);
    }
}