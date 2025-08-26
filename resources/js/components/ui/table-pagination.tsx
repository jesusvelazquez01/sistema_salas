import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationLink{
    url: string| null;
    label:string;
    active: boolean
}

interface TablePaginationProps{
 from: number;
 to:number;
 total:number;
links: PaginationLink[];
OnPageChange: (url:string | null)=>void;
}
export function TablePagination({from, to, total, links, OnPageChange}:TablePaginationProps){

    return (
        <div className="flex items-center justify-between"> 
            <p className="text-sm text-gray-700">
                Mostrando {from} a {to} de {total} items
            </p>
            <Pagination>
                <PaginationContent>
                    {links.map((link, index) => {
                        if (link.label === '&laquo; Previous') {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationPrevious 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            OnPageChange(link.url);
                                        }}
                                        className={!link.url ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            );
                        }
                        
                        if (link.label === 'Next &raquo;') {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationNext 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            OnPageChange(link.url);
                                        }}
                                        className={!link.url ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            );
                        }
                        
                        if (link.label === '...') {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }
                        
                        return (
                            <PaginationItem key={index}>
                                <PaginationLink 
                                    isActive={link.active}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        OnPageChange(link.url);
                                    }}
                                    className="cursor-pointer"
                                >
                                    {link.label}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}
                </PaginationContent>
            </Pagination>
        </div>
    )
}
export default TablePagination