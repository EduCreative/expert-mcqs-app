import { Autocomplete, TextField } from '@mui/material';


const ICON_OPTIONS = [
  '📚','📝','✍️','📖','🗣️','🧠','🔤','✏️','📏','💻','👨‍💻','🖥️','🧑‍💻','🎨','🌐','🖼️','🗄️','🛠️','⚙️','🔢','🧮','🖱️','⌨️','🧲','💾','🖨️','💿','🧩','➗','➕','➖','✖️','📐','🔬','🧪','🌡️','🌍','⚛️','🧲','🧫','🧬','🌱'
];

export default function IconSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <Autocomplete
      freeSolo
      options={ICON_OPTIONS}
      value={value}
      onInputChange={(_, v) => onChange(v)}
      renderInput={(params) => (
        <TextField {...params} label={label || 'Icon'} placeholder="Pick or type an icon" size="small" />
      )}
      sx={{ minWidth: 80, maxWidth: 120 }}
    />
  );
}
