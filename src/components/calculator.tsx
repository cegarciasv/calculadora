"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Plus,
  Minus,
  X,
  Divide,
  Equal,
  Sparkles,
  Delete,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { suggestCalculation } from "@/ai/flows/suggest-calculation";
import { KeypadButton } from "./keypad-button";

const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
});

function formatOperand(operand: string | null): string {
  if (operand == null || operand === "") return "0";
  if (operand === "Error") return "Error";
  if (operand.endsWith(".") && !operand.slice(0, -1).includes(".")) {
    return `${INTEGER_FORMATTER.format(parseInt(operand.slice(0, -1) || '0'))}.`;
  }
  
  const [integer, decimal] = operand.split(".");

  if (decimal == null) {
      if(isNaN(parseInt(integer))) return "Error";
      return INTEGER_FORMATTER.format(BigInt(integer));
  }
  
  return `${INTEGER_FORMATTER.format(BigInt(integer))}.${decimal}`;
}

export function Calculator() {
  const [currentOperand, setCurrentOperand] = useState("0");
  const [previousOperand, setPreviousOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const evaluate = useCallback((): string => {
    if(previousOperand == null || currentOperand == null) return "";
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    if (isNaN(prev) || isNaN(current)) return "";
    let computation: number;
    switch (operation) {
      case "+":
        computation = prev + current;
        break;
      case "-":
        computation = prev - current;
        break;
      case "*":
        computation = prev * current;
        break;
      case "/":
        if (current === 0) return "Error";
        computation = prev / current;
        break;
      default:
        return "";
    }
    return computation.toString();
  }, [currentOperand, previousOperand, operation]);

  const addDigit = useCallback(
    (digit: string) => {
      if (currentOperand === 'Error') return;
      if (overwrite) {
        setCurrentOperand(digit === "." ? "0." : digit);
        setOverwrite(false);
        return;
      }
      if (digit === "0" && currentOperand === "0") return;
      if (digit === "." && currentOperand.includes(".")) return;
      if(currentOperand.length > 15) return;
      setCurrentOperand((prev) => `${prev}${digit}`);
    },
    [currentOperand, overwrite]
  );

  const chooseOperation = useCallback(
    (op: string) => {
      if(currentOperand === 'Error') return;
      if (previousOperand === null) {
        setOperation(op);
        setPreviousOperand(currentOperand);
        setOverwrite(true);
        return;
      }

      if (overwrite) {
        setOperation(op);
        return;
      }
      
      const result = evaluate();
       if (result === 'Error') {
        setCurrentOperand(result);
        setPreviousOperand(null);
        setOperation(null);
        setOverwrite(true);
        return;
      }
      setPreviousOperand(result);
      setOperation(op);
      setOverwrite(true);
    },
    [currentOperand, previousOperand, evaluate, overwrite]
  );
  
  const clearAll = useCallback(() => {
    setCurrentOperand("0");
    setPreviousOperand(null);
    setOperation(null);
    setOverwrite(true);
  }, []);

  const deleteDigit = useCallback(() => {
    if (currentOperand === 'Error') return;
    if (overwrite) return;
    if (currentOperand.length === 1) {
      setCurrentOperand("0");
      setOverwrite(true);
      return;
    }
    setCurrentOperand(currentOperand.slice(0, -1));
  }, [currentOperand, overwrite]);

  const handleEquals = useCallback(() => {
    if (operation === null || previousOperand === null) return;
    const result = evaluate();
    setCurrentOperand(result);
    setPreviousOperand(null);
    setOperation(null);
    setOverwrite(true);
  }, [evaluate, operation, previousOperand]);

  const handleAiSuggest = useCallback(async () => {
    const equation = `${previousOperand || ''} ${operation || ''} ${currentOperand === '0' && previousOperand ? '' : currentOperand || ''}`.trim();
    if (!equation || equation === "0" || currentOperand === 'Error') return;
    
    setIsAiLoading(true);
    setAiSuggestion(null);
    try {
      const result = await suggestCalculation({ equation });
      setAiSuggestion(result.suggestion);
    } catch (e) {
      console.error(e);
      setAiSuggestion("Sorry, I couldn't get a suggestion.");
    } finally {
      setIsAiLoading(false);
    }
  }, [currentOperand, previousOperand, operation]);
  
  const displayValue = useMemo(() => {
    return formatOperand(overwrite ? previousOperand ?? currentOperand : currentOperand);
  }, [currentOperand, previousOperand, overwrite]);

  const historyValue = useMemo(() => {
    if (previousOperand === null || overwrite) return " ";
    return `${formatOperand(previousOperand)} ${operation || ''}`;
  }, [previousOperand, operation, overwrite]);

  return (
    <Card className="w-full max-w-xs sm:max-w-sm mx-auto shadow-2xl rounded-2xl overflow-hidden border-2">
      <CardContent className="p-0">
        <div className="bg-card text-right p-6 space-y-1 min-h-[128px] flex flex-col justify-end">
          <div className="text-muted-foreground text-xl h-7 opacity-75">{historyValue}</div>
          <div className="text-foreground font-bold text-5xl break-words" style={{lineHeight: '1.2'}}>{displayValue}</div>
        </div>
        <div className="grid grid-cols-4 gap-px bg-border">
          <KeypadButton onClick={clearAll} variant="secondary">AC</KeypadButton>
          <KeypadButton onClick={deleteDigit} variant="secondary"><Delete size={28} /></KeypadButton>
          <Popover onOpenChange={(open) => !open && setAiSuggestion(null)}>
            <PopoverTrigger asChild>
              <KeypadButton onClick={handleAiSuggest} variant="secondary" aria-label="AI Suggestion" disabled={isAiLoading}>
                {isAiLoading ? <Loader2 className="animate-spin" size={28} /> : <Sparkles size={28} />}
              </KeypadButton>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">AI Suggestion</h4>
                    <p className="text-sm text-muted-foreground">
                      {isAiLoading ? "Thinking..." : aiSuggestion || "Enter an equation and click the magic wand for a hint!"}
                    </p>
                  </div>
                </div>
              </PopoverContent>
          </Popover>
          <KeypadButton onClick={() => chooseOperation("/")} variant="operator" data-active={operation === '/'}><Divide size={28} /></KeypadButton>
          
          <KeypadButton onClick={() => addDigit("7")}>7</KeypadButton>
          <KeypadButton onClick={() => addDigit("8")}>8</KeypadButton>
          <KeypadButton onClick={() => addDigit("9")}>9</KeypadButton>
          <KeypadButton onClick={() => chooseOperation("*")} variant="operator" data-active={operation === '*'}><X size={28} /></KeypadButton>
          
          <KeypadButton onClick={() => addDigit("4")}>4</KeypadButton>
          <KeypadButton onClick={() => addDigit("5")}>5</KeypadButton>
          <KeypadButton onClick={() => addDigit("6")}>6</KeypadButton>
          <KeypadButton onClick={() => chooseOperation("-")} variant="operator" data-active={operation === '-'}><Minus size={28} /></KeypadButton>
          
          <KeypadButton onClick={() => addDigit("1")}>1</KeypadButton>
          <KeypadButton onClick={() => addDigit("2")}>2</KeypadButton>
          <KeypadButton onClick={() => addDigit("3")}>3</KeypadButton>
          <KeypadButton onClick={() => chooseOperation("+")} variant="operator" data-active={operation === '+'}><Plus size={28} /></KeypadButton>
          
          <KeypadButton onClick={() => addDigit("0")} className="col-span-2">0</KeypadButton>
          <KeypadButton onClick={() => addDigit(".")}>.</KeypadButton>
          <KeypadButton onClick={handleEquals} variant="accent"><Equal size={28} /></KeypadButton>
        </div>
      </CardContent>
    </Card>
  );
}
