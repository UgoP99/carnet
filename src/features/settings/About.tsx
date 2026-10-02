export function About() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">À propos</h1>

      <section className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
        <p>Carnet — version {__APP_VERSION__}</p>
        <p>Données stockées uniquement sur cet appareil.</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Installer sur l'écran d'accueil (iPhone)
        </h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
          <li>Ouvre cette page dans Safari.</li>
          <li>
            Appuie sur <span className="font-medium">Partager</span> (icône avec une flèche vers le
            haut).
          </li>
          <li>
            Choisis <span className="font-medium">Sur l'écran d'accueil</span>.
          </li>
          <li>
            Confirme avec <span className="font-medium">Ajouter</span>.
          </li>
        </ol>
      </section>
    </div>
  );
}
