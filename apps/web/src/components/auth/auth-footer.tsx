import { Link } from 'react-router-dom'

interface AuthFooterProps {
  mode: 'login' | 'signup' | 'forgot'
}

const footerConfig = {
  login: {
    text: "Don't have an account?",
    linkText: 'Sign up',
    linkTo: '/signup',
  },
  signup: {
    text: 'Already have an account?',
    linkText: 'Sign in',
    linkTo: '/login',
  },
  forgot: {
    text: 'Remember your password?',
    linkText: 'Back to sign in',
    linkTo: '/login',
  },
}

export function AuthFooter({ mode }: AuthFooterProps) {
  const config = footerConfig[mode]

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">
        {config.text}{' '}
        <Link
          to={config.linkTo}
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {config.linkText}
        </Link>
      </p>
    </div>
  )
}
