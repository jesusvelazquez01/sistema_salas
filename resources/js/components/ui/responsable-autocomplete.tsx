import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { type Responsable } from '@/types';

interface ResponsableAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  responsables: Responsable[];
  placeholder?: string;
}

export function ResponsableAutocomplete({ 
  value, 
  onChange, 
  responsables, 
  placeholder = "Buscar responsable..." 
}: ResponsableAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredResponsables, setFilteredResponsables] = useState<Responsable[]>([]);

  useEffect(() => {
    if (value.length > 0) {
      const filtered = responsables.filter(responsable =>
        `${responsable.nombre} ${responsable.apellido}`.toLowerCase().includes(value.toLowerCase()) ||
        (responsable.dni || '').includes(value)
      );
      setFilteredResponsables(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredResponsables([]);
      setIsOpen(false);
    }
  }, [value, responsables]);

  const handleSelect = (responsable: Responsable) => {
    onChange(`${responsable.nombre} ${responsable.apellido}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => value.length > 0 && setIsOpen(filteredResponsables.length > 0)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      />
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredResponsables.map((responsable) => (
            <div
              key={responsable.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSelect(responsable)}
            >
              <div className="font-medium">{responsable.nombre} {responsable.apellido}</div>
              <div className="text-sm text-gray-500">DNI: {responsable.dni || 'Sin DNI'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}