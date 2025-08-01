import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import ScoreCircle from './ScoreCircle'
import { usePuterStore } from '~/lib/puter'

const ResumeCard = ({ resume: { id, jobTitle, companyName, feedback, imagePath } }: { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [imageUrl, setImageUrl] = useState<string>('');
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        const loadImage = async () => {
            try {
                setImageLoading(true);
                const imageBlob = await fs.read(imagePath);
                if (imageBlob) {
                    const url = URL.createObjectURL(imageBlob);
                    setImageUrl(url);
                }
            } catch (error) {
                console.error('Error loading image:', error);
            } finally {
                setImageLoading(false);
            }
        };

        if (imagePath) {
            loadImage();
        }

        // Cleanup function to revoke the object URL when component unmounts
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imagePath, fs]);

    return (
        <Link to={`/resume/${id}`} className='resume-card animate-in fade-in duration-1000'>
            <div className='resume-card-header'>
                <div className='flex flex-col gap-2'>
                    <h2 className='!text-black font-bold break-words'>{companyName}</h2>
                    <h3 className='text-lg break-words text-gray-500'>{jobTitle}</h3>
                </div>

                {/* resume score component name ScoreCircle created in the components folder */}
                <div className='flex-shrink-0'>
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>

            {/* displaying the resume image here in the div */}
            <div className='gradient-border animate-in fade-in duration-1000'>
                <div className='w-full h-full'>
                    {imageLoading ? (
                        <div className='w-full h-[350px] max-sm:h-[200px] flex items-center justify-center bg-gray-100'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
                        </div>
                    ) : imageUrl ? (
                        <img 
                            src={imageUrl} 
                            alt="Resume Preview" 
                            className='w-full h-[350px] max-sm:h-[200px] object-cover object-top'
                        />
                    ) : (
                        <div className='w-full h-[350px] max-sm:h-[200px] flex items-center justify-center bg-gray-100 text-gray-500'>
                            Image not available
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ResumeCard