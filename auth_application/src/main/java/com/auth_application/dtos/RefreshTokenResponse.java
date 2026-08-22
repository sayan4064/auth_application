package com.auth_application.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public record RefreshTokenResponse( String accessToken, String refreshToken) {

}
