export const fragment_shader = "precision mediump float;\r\n\r\nuniform vec4 uClippingPlaneA;\r\nuniform vec4 uClippingPlaneB;\r\nuniform bool uClippingA;\r\nuniform bool uClippingB;\r\n\r\n\r\nvarying vec4 vFrontColor;\r\nvarying vec4 vBackColor;\r\n\r\nvarying vec3 vPosition;\r\n\r\nvarying float vDiscard;\r\n\r\nvoid main(void) {\r\n \r\n if ( vDiscard > 0.5) discard;\r\n \r\n \r\n if (uClippingA)\r\n {\r\n \r\n vec4 p = uClippingPlaneA;\r\n vec3 x = vPosition;\r\n float distance = (dot(p.xyz, x) + p.w) / length(p.xyz);\r\n if (distance < 0.0){\r\n discard;\r\n }\r\n \r\n }\r\n\r\n \r\n if (uClippingB)\r\n {\r\n \r\n vec4 p = uClippingPlaneB;\r\n vec3 x = vPosition;\r\n float distance = (dot(p.xyz, x) + p.w) / length(p.xyz);\r\n if (distance < 0.0) {\r\n discard;\r\n }\r\n\r\n }\r\n \r\n \r\n gl_FragColor = gl_FrontFacing ? vFrontColor : vBackColor;\r\n}"