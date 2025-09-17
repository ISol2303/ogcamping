package com.mytech.backend.portal.services;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface FileStorageService {
    String saveFile(MultipartFile file) throws IOException;
    boolean deleteFile(String fileUrl); // thêm hàm mới
}
