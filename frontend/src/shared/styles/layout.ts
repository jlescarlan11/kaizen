export const pageLayout = {
  shellX: 'px-4 md:px-6',
  pageY: 'py-6 md:py-8',
  pageCompactY: 'py-4 md:py-6',
  sectionGap: 'space-y-4 md:space-y-5',
  sectionCompactGap: 'space-y-4 md:space-y-4',
  headerGap: 'space-y-1',
} as const

export const fluidLayout = {
  shellX: 'px-[clamp(1.25rem,5vw,2rem)]',
  shellY: 'py-[clamp(2rem,8vw,4rem)]',
  sectionGap: 'space-y-[clamp(1.5rem,6vw,2.5rem)]',
  touchTarget: 'h-12 min-h-[3rem]',
} as const

export const enterpriseLayout = {
  sidebarFull: 'w-56', // 224px — desktop
  sidebarRail: 'w-14', // 56px  — tablet icon rail
  contentOffsetFull: 'lg:ml-56',
  contentOffsetRail: 'md:ml-14',
  topBarHeight: 'h-12',
  pageX: 'px-4 md:px-6 lg:px-8',
  pageY: 'py-6',
} as const
