import { TextInputSheet } from '@/components/TextInputSheet';

/** "Outra matéria" (02b): campo "Qual matéria?" + CONTINUAR. Monte só enquanto estiver aberta. */
export function OtherSubjectSheet({ onSubmit, onClose }: { onSubmit: (name: string) => void; onClose: () => void }) {
  return <TextInputSheet placeholder="Qual matéria?" onSubmit={onSubmit} onClose={onClose} />;
}
