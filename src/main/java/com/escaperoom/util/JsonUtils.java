package com.escaperoom.util;

import java.util.*;

/**
 * Lightweight, zero-dependency JSON utility for serialization and deserialization.
 * Supports primitives, strings, maps, lists, and POJOs without external libraries.
 */
public class JsonUtils {

    public static String toJson(Object obj) {
        if (obj == null) {
            return "null";
        }
        if (obj instanceof String) {
            return "\"" + escapeJson((String) obj) + "\"";
        }
        if (obj instanceof Number || obj instanceof Boolean) {
            return obj.toString();
        }
        if (obj instanceof Map<?, ?>) {
            Map<?, ?> map = (Map<?, ?>) obj;
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (!first) sb.append(",");
                first = false;
                sb.append("\"").append(escapeJson(String.valueOf(entry.getKey()))).append("\":");
                sb.append(toJson(entry.getValue()));
            }
            sb.append("}");
            return sb.toString();
        }
        if (obj instanceof Collection<?>) {
            Collection<?> col = (Collection<?>) obj;
            StringBuilder sb = new StringBuilder("[");
            boolean first = true;
            for (Object item : col) {
                if (!first) sb.append(",");
                first = false;
                sb.append(toJson(item));
            }
            sb.append("]");
            return sb.toString();
        }
        return "\"" + escapeJson(obj.toString()) + "\"";
    }

    public static String escapeJson(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < ' ') {
                        String t = "000" + Integer.toHexString(c);
                        sb.append("\\u").append(t.substring(t.length() - 4));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }

    /**
     * Parses a simple JSON object string into a Map of String key to Object.
     */
    public static Map<String, Object> parseJsonObject(String json) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (json == null) return map;
        String trimmed = json.trim();
        if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return map;

        String inner = trimmed.substring(1, trimmed.length() - 1).trim();
        if (inner.isEmpty()) return map;

        int len = inner.length();
        int i = 0;
        while (i < len) {
            // Find key
            while (i < len && (Character.isWhitespace(inner.charAt(i)) || inner.charAt(i) == ',')) i++;
            if (i >= len) break;

            if (inner.charAt(i) != '"') break;
            int keyStart = ++i;
            while (i < len && inner.charAt(i) != '"') {
                if (inner.charAt(i) == '\\' && i + 1 < len) i++;
                i++;
            }
            String key = inner.substring(keyStart, i);
            i++; // skip closing quote

            // Skip until colon
            while (i < len && inner.charAt(i) != ':') i++;
            if (i >= len) break;
            i++; // skip colon
            while (i < len && Character.isWhitespace(inner.charAt(i))) i++;
            if (i >= len) break;

            // Parse value
            char c = inner.charAt(i);
            Object value = null;
            if (c == '"') {
                int valStart = ++i;
                StringBuilder valSb = new StringBuilder();
                while (i < len && inner.charAt(i) != '"') {
                    if (inner.charAt(i) == '\\' && i + 1 < len) {
                        i++;
                        char escaped = inner.charAt(i);
                        if (escaped == 'n') valSb.append('\n');
                        else if (escaped == 't') valSb.append('\t');
                        else if (escaped == '"') valSb.append('"');
                        else if (escaped == '\\') valSb.append('\\');
                        else valSb.append(escaped);
                    } else {
                        valSb.append(inner.charAt(i));
                    }
                    i++;
                }
                value = valSb.toString();
                i++; // skip quote
            } else if (c == '{' || c == '[') {
                // Nested structure: skip matching braces/brackets
                char open = c;
                char close = (c == '{') ? '}' : ']';
                int depth = 1;
                int start = i++;
                while (i < len && depth > 0) {
                    if (inner.charAt(i) == open) depth++;
                    else if (inner.charAt(i) == close) depth--;
                    i++;
                }
                value = inner.substring(start, i);
            } else {
                // Number, boolean or null
                int valStart = i;
                while (i < len && inner.charAt(i) != ',' && inner.charAt(i) != '}') i++;
                String raw = inner.substring(valStart, i).trim();
                if ("true".equalsIgnoreCase(raw)) value = Boolean.TRUE;
                else if ("false".equalsIgnoreCase(raw)) value = Boolean.FALSE;
                else if ("null".equalsIgnoreCase(raw)) value = null;
                else {
                    try {
                        if (raw.contains(".")) {
                            value = Double.parseDouble(raw);
                        } else {
                            value = Long.parseLong(raw);
                        }
                    } catch (NumberFormatException e) {
                        value = raw;
                    }
                }
            }
            map.put(key, value);
        }
        return map;
    }
}
