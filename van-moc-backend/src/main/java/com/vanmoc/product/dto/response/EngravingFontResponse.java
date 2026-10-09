package com.vanmoc.product.dto.response;

public record EngravingFontResponse(String code, String name, String fileUrl, String cssUrl,
                                    String fontFamily, Integer fontWeight, boolean italic, boolean active) {}
