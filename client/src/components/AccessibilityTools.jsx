import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  SunIcon, 
  MoonIcon, 
  Type, 
  Glasses, 
  PanelRightOpen,
  Languages,
  ArrowDownWideNarrow,
  Maximize,
  Minimize,
  Eye
} from "lucide-react";

/**
 * Composant pour les outils d'accessibilité
 * Permet d'ajuster la taille du texte, le thème, l'espacement des lignes et plus
 */
const AccessibilityTools = ({ theme, setTheme, textSize, setTextSize, lineSpacing, setLineSpacing }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(true);
  
  const applyHighContrast = () => {
    const root = document.documentElement;
    if (highContrast) {
      root.style.setProperty('--background', '#000000');
      root.style.setProperty('--foreground', '#ffffff');
      root.style.setProperty('--muted', '#333333');
      root.style.setProperty('--card', '#0a0a0a');
    } else {
      // Réinitialiser les variables CSS à leurs valeurs par défaut
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--card');
    }
  };
  
  const applyDyslexicFont = () => {
    const root = document.documentElement;
    if (dyslexicFont) {
      root.style.setProperty('--font-sans', '"OpenDyslexic", sans-serif');
    } else {
      root.style.removeProperty('--font-sans');
    }
  };
  
  const applyUnderlineLinks = () => {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      if (underlineLinks) {
        link.style.textDecoration = 'underline';
      } else {
        link.style.textDecoration = 'none';
      }
    });
  };
  
  // Appliquer les changements chaque fois qu'une option change
  React.useEffect(() => {
    applyHighContrast();
    applyDyslexicFont();
    applyUnderlineLinks();
    
    // Mettre à jour les classes globales pour le thème
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [highContrast, dyslexicFont, underlineLinks, theme]);

  return (
    <div className="sticky top-0 z-10 w-full bg-background border-b p-2">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Glasses size={16} />
          <span>Accessibilité</span>
          <PanelRightOpen size={16} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>
        
        {/* Toujours afficher les options les plus importantes */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
          >
            {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setTextSize(Math.max(0.8, textSize - 0.1))}
            title="Réduire la taille du texte"
          >
            <Type size={14} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setTextSize(Math.min(1.5, textSize + 0.1))}
            title="Augmenter la taille du texte"
          >
            <Type size={18} />
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 p-4 bg-muted/20 rounded-md">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="text-size" className="flex items-center gap-2">
                <Type size={16} /> Taille du texte
              </Label>
              <span className="text-xs">{Math.round(textSize * 100)}%</span>
            </div>
            <Slider
              id="text-size"
              min={0.8}
              max={1.5}
              step={0.05}
              value={[textSize]}
              onValueChange={(value) => setTextSize(value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="line-spacing" className="flex items-center gap-2">
                <ArrowDownWideNarrow size={16} /> Espacement des lignes
              </Label>
              <span className="text-xs">{Math.round(lineSpacing * 100)}%</span>
            </div>
            <Slider
              id="line-spacing"
              min={1}
              max={2}
              step={0.1}
              value={[lineSpacing]}
              onValueChange={(value) => setLineSpacing(value[0])}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-switch" className="flex items-center gap-2">
                {theme === 'dark' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
                Thème {theme === 'dark' ? 'sombre' : 'clair'}
              </Label>
              <Switch 
                id="theme-switch" 
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="contrast-switch" className="flex items-center gap-2">
                <Eye size={16} />
                Contraste élevé
              </Label>
              <Switch 
                id="contrast-switch" 
                checked={highContrast}
                onCheckedChange={setHighContrast}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dyslexic-switch" className="flex items-center gap-2">
                <Glasses size={16} />
                Police dyslexique
              </Label>
              <Switch 
                id="dyslexic-switch" 
                checked={dyslexicFont}
                onCheckedChange={setDyslexicFont}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="links-switch" className="flex items-center gap-2">
                <Maximize size={16} />
                Souligner les liens
              </Label>
              <Switch 
                id="links-switch" 
                checked={underlineLinks}
                onCheckedChange={setUnderlineLinks}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language-select" className="flex items-center gap-2">
              <Languages size={16} />
              Langue du document
            </Label>
            <Select defaultValue="fr">
              <SelectTrigger id="language-select">
                <SelectValue placeholder="Sélectionner une langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setTextSize(1);
                setLineSpacing(1.5);
                setHighContrast(false);
                setDyslexicFont(false);
                setUnderlineLinks(true);
                setTheme('light');
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityTools;