import {type FormEvent, useState} from 'react'
import type { Route } from "./+types/uploadResume";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2image";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Upload Resume - Resumind | AI-Powered Resume Analysis" },
        { name: "description", content: "Upload your resume for instant AI-powered analysis. Get ATS scores, improvement tips, and personalized feedback to land your dream job." },
        { name: "keywords", content: "resume analysis, ATS score, resume optimization, job application, AI feedback, career improvement, resume scanner, CV analysis, job search" },
        { name: "author", content: "Resumind" },
        { name: "robots", content: "index, follow" },
        { name: "googlebot", content: "index, follow" },
        { name: "bingbot", content: "index, follow" },
        { property: "og:title", content: "Upload Resume - AI-Powered Resume Analysis | Resumind" },
        { property: "og:description", content: "Get instant AI feedback on your resume. Upload now for ATS scores and improvement tips." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://resumind.com/upload" },
        { property: "og:image", content: "https://resumind.com/images/og-upload.png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:site_name", content: "Resumind" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Upload Resume - AI Resume Analysis" },
        { name: "twitter:description", content: "Get instant AI feedback on your resume. Upload now for ATS scores and improvement tips." },
        { name: "twitter:image", content: "https://resumind.com/images/og-upload.png" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#8e98ff" },
        { rel: "canonical", href: "https://resumind.com/upload" },
        {
            "script:ld+json": {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "Resumind - AI Resume Analyzer",
                "description": "Upload your resume for instant AI-powered analysis. Get ATS scores, improvement tips, and personalized feedback.",
                "url": "https://resumind.com/upload",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "featureList": [
                    "AI-powered resume analysis",
                    "ATS compatibility scoring",
                    "Personalized improvement tips",
                    "Job-specific feedback"
                ]
            }
        }
    ];
}

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);

        setStatusText('Uploading the file...');
        const uploadedFile = await fs.upload([file]);
        if(!uploadedFile) return setStatusText('Error: Failed to upload file');

        setStatusText('Converting to image...');
        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');

        setStatusText('Uploading the image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if(!uploadedImage) return setStatusText('Error: Failed to upload image');

        setStatusText('Preparing data...');
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            feedback: '',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analyzing...');

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription })
        )
        if (!feedback) return setStatusText('Error: Failed to analyze resume');

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analysis complete, redirecting...');
        console.log(data);
        navigate(`/resume/${uuid}`);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />

            {isProcessing ? (
                // Full-screen processing state with proper 100vh alignment
                <section className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto">
                        <h1 className="mb-8">Analyzing Your Resume</h1>
                        <div className="mb-8">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl mb-6 animate-pulse">{statusText}</h2>
                        </div>
                        <div className="flex justify-center">
                            <img 
                                src="/images/resume-scan.gif" 
                                alt="Resume scanning animation"
                                className="w-full max-w-md h-auto object-contain"
                                loading="eager"
                            />
                        </div>
                    </div>
                </section>
            ) : (
                // Upload form state
                <section className="main-section">
                    <div className="page-heading py-8 sm:py-12 lg:py-16">
                        <h1>Smart feedback for your dream job</h1>
                        <h2 className="mb-8 sm:mb-12">Drop your resume for an ATS score and improvement tips</h2>
                        
                        <form 
                            id="upload-form" 
                            onSubmit={handleSubmit} 
                            className="flex flex-col gap-6 sm:gap-8 mt-8 w-full max-w-2xl"
                            noValidate
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="form-div">
                                    <label htmlFor="company-name" className="block text-sm font-medium mb-2">
                                        Company Name *
                                    </label>
                                    <input 
                                        type="text" 
                                        name="company-name" 
                                        placeholder="e.g., Google, Microsoft" 
                                        id="company-name"
                                        required
                                        aria-describedby="company-name-help"
                                        className="transition-all duration-200 hover:shadow-md focus:shadow-lg"
                                    />
                                </div>
                                <div className="form-div">
                                    <label htmlFor="job-title" className="block text-sm font-medium mb-2">
                                        Job Title *
                                    </label>
                                    <input 
                                        type="text" 
                                        name="job-title" 
                                        placeholder="e.g., Software Engineer" 
                                        id="job-title"
                                        required
                                        aria-describedby="job-title-help"
                                        className="transition-all duration-200 hover:shadow-md focus:shadow-lg"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-div">
                                <label htmlFor="job-description" className="block text-sm font-medium mb-2">
                                    Job Description *
                                </label>
                                <textarea 
                                    rows={5} 
                                    name="job-description" 
                                    placeholder="Paste the job description here to get personalized feedback..." 
                                    id="job-description"
                                    required
                                    aria-describedby="job-description-help"
                                    className="transition-all duration-200 hover:shadow-md focus:shadow-lg resize-vertical min-h-[120px]"
                                />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader" className="block text-sm font-medium mb-2">
                                    Upload Resume *
                                </label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button 
                                className="primary-button mt-4 py-4 text-lg font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
                                type="submit"
                                disabled={!file}
                                aria-describedby="submit-help"
                            >
                                {file ? 'Analyze Resume' : 'Please Upload Resume First'}
                            </button>
                            
                            <p className="text-sm text-gray-600 text-center mt-4">
                                * Required fields. Your resume will be analyzed using AI to provide personalized feedback.
                            </p>
                        </form>
                    </div>
                </section>
            )}
        </main>
    )
}
export default Upload