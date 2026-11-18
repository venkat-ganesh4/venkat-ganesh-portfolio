import type { ProjectsPageContent } from '../types/projects';

export const projectsContent: ProjectsPageContent = {
  eyebrow: '// Engineering Showcase',
  title: 'Projects & Case Studies',
  description:
    'Detailed explorations in software development, machine learning, and computer vision. Each project emphasizes clean architecture, practical problem solving, and technical craft.',
  categories: ['All', 'Computer Vision', 'AI / Machine Learning', 'Interactive Web'],
  projects: [
    {
      id: 'vision-perception',
      slug: 'vision-perception',
      title: 'Real-Time Vision Perception Pipeline',
      subtitle: 'Low-latency multi-object detection and spatial tracking engine',
      category: 'Computer Vision',
      badgeTone: 'emerald',
      year: '2025',
      summary:
        'An experimental video processing engine exploring camera stream ingestion, image preprocessing, and real-time bounding box tracking for multi-object detection.',
      problemStatement:
        'Processing high-frame-rate video streams while maintaining real-time frame rates (60 FPS) on resource-constrained compute hardware often leads to frame drops and memory spikes when inference threads block video ingestion.',
      architectureApproach:
        'Engineered an asynchronous pipeline architecture with zero-copy buffer sharing between OpenCV capture loops and background PyTorch inference workers. Used threaded frame queues with adaptive frame dropping to prevent pipeline latency buildup.',
      deliverables: [
        {
          title: 'Asynchronous Frame Ingestion Queue',
          description:
            'Decoupled camera capture from neural model inference to guarantee continuous 60 FPS video capture without blocking the main event loop.',
        },
        {
          title: 'Spatial Smoothing & Kalman Tracking',
          description:
            'Implemented centroid tracking and Kalman filter estimation to stabilize jittery bounding box detections between consecutive frames.',
        },
        {
          title: 'WebSocket Telemetry Streamer',
          description:
            'Streamed live bounding-box coordinates, detection confidence scores, and FPS telemetry over WebSocket connections to a lightweight browser client.',
        },
        {
          title: 'Adaptive Compute Throttling',
          description:
            'Dynamically scaled inference resolution when system temperature or frame latency exceeded safety thresholds.',
        },
      ],
      techStack: [
        { name: 'Python', role: 'Primary Implementation Language' },
        { name: 'OpenCV', role: 'Video Capture & Image Transformations' },
        { name: 'PyTorch', role: 'Neural Object Detection Inference' },
        { name: 'FastAPI', role: 'Telemetry Server & API' },
        { name: 'NumPy', role: 'Matrix Computations & Frame Arrays' },
        { name: 'WebSockets', role: 'Real-Time Browser Streaming' },
      ],
      keyLearnings: [
        'Classical image operations (color-space transforms, blurring) are significantly faster when batch-processed before converting to tensors.',
        'Zero-copy memory sharing between C++ OpenCV buffers and Python memoryviews eliminated 40% of buffer copy overhead.',
      ],
      links: {
        github: 'https://github.com',
      },
    },
    {
      id: 'document-intelligence',
      slug: 'document-intelligence',
      title: 'Neural Document Intelligence System',
      subtitle: 'Automated layout parsing, optical character recognition, and entity extraction pipeline',
      category: 'AI / Machine Learning',
      badgeTone: 'gold',
      year: '2025',
      summary:
        'An automated document comprehension pipeline parsing structured data from raw images, receipts, and multi-page PDFs using optical character recognition and multimodal models.',
      problemStatement:
        'Scanned paper documents frequently feature skew, shadows, and irregular table layouts that cause standard OCR engines to jumble column text and lose spatial context.',
      architectureApproach:
        'Developed a two-stage pipeline: a computer vision pre-processing module for document contour detection, de-skewing, and adaptive binarization, followed by a transformer-based spatial layout parser that reconstructs hierarchical table structure.',
      deliverables: [
        {
          title: 'Contour Detection & Perspective Rectification',
          description:
            'Used OpenCV edge detection and four-point perspective transforms to flatten angled camera scans into uniform planar documents.',
        },
        {
          title: 'Table Cell Segmentation',
          description:
            'Morphological kernels detect vertical and horizontal line masks to identify table bounding cells with high precision.',
        },
        {
          title: 'Structured Schema Normalization',
          description:
            'Mapped extracted text tokens into strongly-typed JSON schemas with automated validation and confidence scoring.',
        },
        {
          title: 'Containerized Microservice Pipeline',
          description:
            'Packaged the extraction engine into a Docker container with health monitoring and background job processing.',
        },
      ],
      techStack: [
        { name: 'Python', role: 'Core Pipeline Language' },
        { name: 'Transformers', role: 'Layout-Aware Language Models' },
        { name: 'OpenCV', role: 'De-skewing & Image Enhancement' },
        { name: 'Tesseract OCR', role: 'Base Text Extraction' },
        { name: 'Docker', role: 'Containerization & Environment' },
        { name: 'FastAPI', role: 'REST Ingestion Service' },
      ],
      keyLearnings: [
        'Pre-processing image quality (de-skewing and contrast adjustment) provided a larger accuracy improvement than swapping the downstream OCR engine.',
        'Hierarchical bounding boxes must preserve relative spatial coordinates to maintain reading order across multi-column documents.',
      ],
      links: {
        github: 'https://github.com',
      },
    },
    {
      id: 'spatial-viz-studio',
      slug: 'spatial-viz-studio',
      title: 'Spatial Data Visualization Studio',
      subtitle: 'High-density interactive map and spatial telemetry canvas application',
      category: 'Interactive Web',
      badgeTone: 'lavender',
      year: '2024',
      summary:
        'A high-performance interactive web dashboard rendering large-scale spatial coordinate datasets with custom viewport canvas controls, interactive layers, and analytics widgets.',
      problemStatement:
        'DOM-based SVG rendering begins to stutter and drop frames when visualizing tens of thousands of coordinate nodes simultaneously, especially during rapid pan and zoom operations.',
      architectureApproach:
        'Implemented a dual-layer HTML5 Canvas architecture backed by a QuadTree spatial indexing algorithm. Viewport calculations only query and render points intersecting the active screen bounding box.',
      deliverables: [
        {
          title: 'QuadTree Spatial Indexing',
          description:
            'Partitioned spatial data into hierarchical 2D bounds to enable logarithmic time complexity for point-in-viewport queries.',
        },
        {
          title: 'Dual-Layer Canvas Pipeline',
          description:
            'Separated static background map layers from dynamic interactive hover and selection overlays to minimize re-renders.',
        },
        {
          title: 'Smooth Coordinate Navigation',
          description:
            'Custom matrix transforms for pan, zoom, and coordinate snapping with 60 FPS animation smoothness.',
        },
        {
          title: 'Telemetry Inspection Drawer',
          description:
            'Detailed inspection panel showing latitude, longitude, elevation, and custom metadata for any selected node.',
        },
      ],
      techStack: [
        { name: 'React 19', role: 'Interface State Management' },
        { name: 'TypeScript', role: 'Type Safety & Spatial Data Models' },
        { name: 'HTML5 Canvas API', role: 'High-Density 2D Rendering' },
        { name: 'Vite', role: 'Build Tooling & Fast HMR' },
        { name: 'CSS Custom Properties', role: 'Theme Tokens & CAD Aesthetic' },
      ],
      keyLearnings: [
        'Batching Canvas draw calls by color and line thickness reduced context switching overhead by 65%.',
        'Decoupling mouse position math from the React component render cycle via requestAnimationFrame prevented input lag.',
      ],
      links: {
        github: 'https://github.com',
        demo: 'https://github.com',
      },
    },
    {
      id: 'edge-ai-benchmark',
      slug: 'edge-ai-benchmark',
      title: 'Edge AI Inference Benchmark Suite',
      subtitle: 'Cross-hardware latency and memory profiling harness for quantized neural models',
      category: 'AI / Machine Learning',
      badgeTone: 'gold',
      year: '2024',
      summary:
        'A benchmarking tool measuring inference latency, cold-start delays, memory footprint, and CPU/GPU utilization for quantized machine learning models across heterogeneous hardware.',
      problemStatement:
        'Deploying neural models to edge hardware requires precise profiling of memory and execution bottlenecks, but existing tools are often tied to specific cloud vendors or monolithic frameworks.',
      architectureApproach:
        'Created a modular Python benchmarking suite with automated warm-up iterations, percentile latency calculations (p50, p95, p99), and clean terminal telemetry visualizations.',
      deliverables: [
        {
          title: 'Percentile Latency Analysis',
          description:
            'Measures median, p95, and p99 execution latencies across 1,000+ continuous inference runs.',
        },
        {
          title: 'Quantization Comparison Module',
          description:
            'Evaluates FP32, FP16, and INT8 model variants to inspect accuracy vs speed trade-offs.',
        },
        {
          title: 'Hardware Telemetry Logger',
          description:
            'Monitors VRAM and CPU utilization during continuous inference load.',
        },
      ],
      techStack: [
        { name: 'Python', role: 'Profiling Engine' },
        { name: 'PyTorch', role: 'Model Inference' },
        { name: 'ONNX Runtime', role: 'Cross-Platform Optimization' },
        { name: 'NumPy', role: 'Statistical Computation' },
      ],
      links: {
        github: 'https://github.com',
      },
    },
    {
      id: 'editorial-design-system',
      slug: 'editorial-design-system',
      title: 'Architectural UI Design System',
      subtitle: 'Strict geometric UI design token engine with zero-dependency dual theming',
      category: 'Interactive Web',
      badgeTone: 'sage',
      year: '2024',
      summary:
        'A bespoke design token engine emphasizing digital architecture, editorial typography, and high-contrast accessibility with zero pill-shaped buttons and zero purple gradients.',
      problemStatement:
        'Most modern portfolios rely on identical generic templates with rounded pill buttons and muddy drop shadows, lacking architectural identity and technical character.',
      architectureApproach:
        'Constructed pure CSS custom property design tokens anchored by Forest Emerald, Midnight Navy, Warm Ivory, Soft Sage, Champagne Gold, and Muted Lavender, paired with Space Grotesk, Inter, and JetBrains Mono.',
      deliverables: [
        {
          title: 'Zero-Flicker Dual Theme Engine',
          description:
            'Pre-hydration theme detection script preventing flash of unstyled theme on page load.',
        },
        {
          title: 'Strict Geometric Primitive Tokens',
          description:
            'Strict 2px chamfered corners, CAD crosshair markers, and tactile micro-transitions.',
        },
        {
          title: 'Accessibility & Reduced Motion',
          description:
            'WCAG AAA color contrast ratios, 2px focus indicators, and full prefers-reduced-motion overrides.',
        },
      ],
      techStack: [
        { name: 'React 19', role: 'Component Framework' },
        { name: 'TypeScript', role: 'Strongly Typed Token Architecture' },
        { name: 'CSS Variables', role: 'Dynamic Theme Tokens' },
        { name: 'Vite', role: 'Build Environment' },
      ],
      links: {
        github: 'https://github.com',
      },
    },
  ],
};
