import { cva } from 'class-variance-authority'

export const buttonVariants = cva('button', {
  variants: {
    variant: {
      primary: 'button--primary',
      secondary: 'button--secondary',
      danger: 'button--danger',
    },
    size: {
      small: 'button--small',
      medium: 'button--medium',
    },
  },
  defaultVariants: { variant: 'primary', size: 'medium' },
})
