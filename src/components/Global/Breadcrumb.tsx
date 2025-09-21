
// // components/Breadcrumb.tsx
// import React from 'react';
// import {
//     Breadcrumb as ShadcnBreadcrumb,
//     BreadcrumbItem,
//     BreadcrumbLink,
//     BreadcrumbList,
//     BreadcrumbPage,
//     BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { colors } from "@/components/Global/colors";

// // Define the structure for each breadcrumb item
// export interface BreadcrumbItem {
//     label: string;
//     href?: string;
//     isCurrentPage?: boolean;
// }

// interface BreadcrumbProps {
//     items: BreadcrumbItem[];
//     className?: string;
//     sticky?: boolean; // New prop for sticky behavior
// }

// const Breadcrumb: React.FC<BreadcrumbProps> = ({
//     items,
//     className = '',
//     sticky = true
// }) => {
//     // Determine sticky classes based on the sticky prop
//     const stickyClasses = sticky ? 'sticky top-[60px] z-30 shadow-sm bg-white' : '';

//     return (
//         <div className={`border-b ${colors.secondaryDark} shadow-sm py-3 ${colors.lightBg} w-full px-4 md:px-10 lg:px-12 xl:px-24 ${stickyClasses} ${className}`}>
//             <div className="px-4">
//                 <ShadcnBreadcrumb>
//                     <BreadcrumbList className="text-sm">
//                         {items.map((item, index) => (
//                             <React.Fragment key={item.label}>
//                                 <BreadcrumbItem>
//                                     {item.isCurrentPage || index === items.length - 1 ? (
//                                         <BreadcrumbPage className={`${colors.primary} font-medium truncate`}>
//                                             {item.label}
//                                         </BreadcrumbPage>
//                                     ) : (
//                                         <BreadcrumbLink
//                                             href={item.href || '#'}
//                                             className={`hover:${colors.primary} transition-colors`}
//                                         >
//                                             {item.label}
//                                         </BreadcrumbLink>
//                                     )}
//                                 </BreadcrumbItem>
//                                 {index < items.length - 1 && <BreadcrumbSeparator />}
//                             </React.Fragment>
//                         ))}
//                     </BreadcrumbList>
//                 </ShadcnBreadcrumb>
//             </div>
//         </div>
//     );
// };

// export default Breadcrumb;