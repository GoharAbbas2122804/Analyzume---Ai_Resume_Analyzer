interface ScoreCircleProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

const ScoreCircle = ({ score = 75, size = 'medium' }: ScoreCircleProps) => {
  // Define size-specific values
  const sizeConfig = {
    small: {
      containerSize: 'w-[80px] h-[80px]',
      radius: 32,
      stroke: 6,
      fontSize: 'text-xs'
    },
    medium: {
      containerSize: 'w-[100px] h-[100px]',
      radius: 40,
      stroke: 8,
      fontSize: 'text-sm'
    },
    large: {
      containerSize: 'w-[150px] h-[150px]',
      radius: 60,
      stroke: 10,
      fontSize: 'text-lg font-bold'
    }
  };

  const config = sizeConfig[size];
  const radius = config.radius;
  const stroke = config.stroke;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={`relative ${config.containerSize}`}>
      <svg
        height="100%"
        width="100%"
        viewBox="0 0 100 100"
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="transparent"
        />
        {/* Partial circle with gradient */}
        <defs>
          <linearGradient id="grad" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF97AD" />
            <stop offset="100%" stopColor="#5171FF" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke="url(#grad)"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Score and issues */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-semibold ${config.fontSize}`}>{`${score}/100`}</span>
      </div>
    </div>
  );
};

export default ScoreCircle;