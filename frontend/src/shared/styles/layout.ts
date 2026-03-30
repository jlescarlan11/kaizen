export const pageLayout = {
  shellX: 'px-5 md:px-8',
  pageY: 'py-8 md:py-12',
  pageCompactY: 'py-5 md:py-8',
  sectionGap: 'space-y-6 md:space-y-7',
  sectionCompactGap: 'space-y-5 md:space-y-6',
  headerGap: 'space-y-2',
} as const

export const fluidLayout = {
  shellX: 'px-[clamp(1.25rem,5vw,2rem)]',
  shellY: 'py-[clamp(2rem,8vw,4rem)]',
  sectionGap: 'space-y-[clamp(1.5rem,6vw,2.5rem)]',
  touchTarget: 'h-12 min-h-[3rem]',
} as const
