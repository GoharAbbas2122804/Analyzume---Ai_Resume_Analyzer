// import { type RouteConfig, index, route } from "@react-router/dev/routes";

// export default [
//     index("routes/home.tsx"),
//     route('/auth' , 'routes/auth.tsx'),
//     route('/upload', 'routes/uploadResume.tsx'),
//     route('/resume/:id', 'routes/resume.tsx')
    
// ] satisfies RouteConfig;



import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('/auth', 'routes/auth.tsx'),
    route('/upload', 'routes/uploadResume.tsx'),
    route('/resume/:id', 'routes/resume.tsx'),
    route('/wipe', 'routes/wipe.tsx'),
] satisfies RouteConfig;