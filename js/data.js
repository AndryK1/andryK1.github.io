/*
 * Все данные для разделов «Проекты» и «Образование».
 *
 * Как добавить новый проект: скопируй любой объект из PROJECTS, поменяй поля,
 * а картинки положи в images/projects/<имя>/thumbs (превью ~420px) и /full (оригиналы).
 *  - Первые три проекта летают по внутренней орбите, остальные — по внешней.
 *  - wip: true — «планета в разработке» с вопросительным знаком.
 *  - Без icon вместо картинки показывается номер проекта.
 */

window.PROJECTS = [
  {
    num: '01',
    title: 'Список покупок',
    kind: 'Командный проект',
    hue: '#FFDCBB',
    icon: 'images/icons/shopping-list.svg',
    stack: 'Kotlin · Compose · MVI · Room · Koin · detekt',
    role: 'Android-разработчик в команде',
    part: 'Экраны «Мои списки» и «Продукты»',
    time: '2 недели',
    repo: 'https://gitlab.com/practicum-op-cohort-26-3/shopping-list-team-26-3',
    repoLabel: 'Код на GitLab',
    about: 'Приложение для списков покупок: создаёте списки, добавляете товары с количеством и единицами измерения и отмечаете, что уже куплено.',
    features: [
      'Несколько списков, у каждого своя иконка — 30 вариантов на выбор',
      'Товары с количеством и единицами: шт, кг, г, л, мл, уп, пач',
      'Отметка купленного и очистка купленных одним действием',
      'Сортировка по алфавиту или в своём порядке',
      'Поиск по спискам',
      'Светлая и тёмная тема, онбординг и пустые состояния с иллюстрациями'
    ],
    tech: [
      'Чистая архитектура: слои core, data, domain, presentation и ui; к data-слою обращаемся через UseCase',
      'UI на Jetpack Compose по MVI — паттерн выбрали, чтобы освоить его на практике',
      'Хранение данных — Room, внедрение зависимостей — Koin',
      'Общий BaseViewModel для всех ViewModel и переиспользуемые UI-компоненты',
      'Цвета, отступы и темы вынесены в пакет theme; цвет иконки подстраивается под тему устройства',
      'Статический анализ кода — detekt'
    ],
    shots: [
      { thumb: 'images/projects/shopping-list/thumbs/01.jpg', full: 'images/projects/shopping-list/full/01.jpg', cap: 'Онбординг', alt: 'Приветственный экран приложения Список покупок' },
      { thumb: 'images/projects/shopping-list/thumbs/02.jpg', full: 'images/projects/shopping-list/full/02.jpg', cap: 'Список товаров', alt: 'Список товаров с количеством и отметками' },
      { thumb: 'images/projects/shopping-list/thumbs/03.jpg', full: 'images/projects/shopping-list/full/03.jpg', cap: 'Добавление товара', alt: 'Панель добавления товара с количеством и единицами' },
      { thumb: 'images/projects/shopping-list/thumbs/04.jpg', full: 'images/projects/shopping-list/full/04.jpg', cap: 'Иконка списка', alt: 'Выбор иконки для списка' },
      { thumb: 'images/projects/shopping-list/thumbs/05.jpg', full: 'images/projects/shopping-list/full/05.jpg', cap: 'Тёмная тема', alt: 'Главный экран со списками в тёмной теме' },
      { thumb: 'images/projects/shopping-list/thumbs/06.jpg', full: 'images/projects/shopping-list/full/06.jpg', cap: 'Сортировка и очистка', alt: 'Меню сортировки и очистки купленных товаров' }
    ]
  },
  {
    num: '02',
    title: 'Playlist Maker',
    kind: 'Учебный проект',
    hue: '#9A9A9A',
    icon: 'images/icons/playlist-maker.svg',
    stack: 'Kotlin · XML · MVVM · Coroutines · Room · Retrofit · Koin',
    role: 'Android-разработчик',
    part: 'Всё приложение целиком',
    time: '≈ 6 месяцев',
    repo: 'https://github.com/AndryK1/PlayList_Maker_one',
    repoLabel: 'Код на GitHub',
    about: 'Музыкальный плеер: поиск треков через iTunes API, потоковое воспроизведение, избранное и собственные плейлисты с обложками. Сделан целиком самостоятельно, чтобы освоить современные инструменты Android-разработки, паттерны проектирования и работу с Git.',
    features: [
      'Поиск треков с историей и состояниями: загрузка, «ничего не нашлось», «нет сети»',
      'Экран трека: обложка, альбом, год, жанр, страна и потоковое воспроизведение',
      'Избранные треки и медиатека с вкладками',
      'Плейлисты: создание с обложкой и описанием, редактирование, удаление, «Поделиться»',
      'Добавление трека в плейлист с проверкой на дубли',
      'Светлая и тёмная тема, «Поделиться приложением», поддержка и пользовательское соглашение'
    ],
    tech: [
      'Single Activity и Navigation Component: экраны на фрагментах, вкладки медиатеки на ViewPager2',
      'Clean Architecture + MVVM: слои data, domain, ui, di, utils; бизнес-логика в Use Cases',
      'UI на XML: Custom Views и View Binding',
      'Сеть: Retrofit + OkHttp и iTunes API, обложки через Glide',
      'Локальное хранение в Room, асинхронность на Coroutines и Flow',
      'Внедрение зависимостей через Koin, воспроизведение — MediaPlayer'
    ],
    shots: [
      { thumb: 'images/projects/playlist-maker/thumbs/01.jpg', full: 'images/projects/playlist-maker/full/01.jpg', cap: 'Экран поиска', alt: 'Экран поиска с историей «Вы искали»' },
      { thumb: 'images/projects/playlist-maker/thumbs/02.jpg', full: 'images/projects/playlist-maker/full/02.jpg', cap: 'Поиск треков', alt: 'Результаты поиска треков с обложками' },
      { thumb: 'images/projects/playlist-maker/thumbs/03.jpg', full: 'images/projects/playlist-maker/full/03.jpg', cap: 'Загрузка треков', alt: 'Индикатор загрузки треков' },
      { thumb: 'images/projects/playlist-maker/thumbs/04.jpg', full: 'images/projects/playlist-maker/full/04.jpg', cap: 'Нет интернета', alt: 'Состояние без интернета с кнопкой «Обновить»' },
      { thumb: 'images/projects/playlist-maker/thumbs/05.jpg', full: 'images/projects/playlist-maker/full/05.jpg', cap: 'Ничего не нашлось', alt: 'Пустой результат поиска' },
      { thumb: 'images/projects/playlist-maker/thumbs/06.jpg', full: 'images/projects/playlist-maker/full/06.jpg', cap: 'Экран трека', alt: 'Экран трека с информацией об альбоме' },
      { thumb: 'images/projects/playlist-maker/thumbs/07.jpg', full: 'images/projects/playlist-maker/full/07.jpg', cap: 'Добавление трека в плейлист', alt: 'Добавление трека в плейлист' },
      { thumb: 'images/projects/playlist-maker/thumbs/08.jpg', full: 'images/projects/playlist-maker/full/08.jpg', cap: 'Трек уже добавлен', alt: 'Уведомление, что трек уже добавлен в плейлист' },
      { thumb: 'images/projects/playlist-maker/thumbs/09.jpg', full: 'images/projects/playlist-maker/full/09.jpg', cap: 'Медиатека · избранное', alt: 'Медиатека, вкладка избранных треков' },
      { thumb: 'images/projects/playlist-maker/thumbs/10.jpg', full: 'images/projects/playlist-maker/full/10.jpg', cap: 'Медиатека · плейлисты', alt: 'Медиатека, вкладка плейлистов' },
      { thumb: 'images/projects/playlist-maker/thumbs/11.jpg', full: 'images/projects/playlist-maker/full/11.jpg', cap: 'Создание нового плейлиста', alt: 'Создание плейлиста с обложкой и описанием' },
      { thumb: 'images/projects/playlist-maker/thumbs/12.jpg', full: 'images/projects/playlist-maker/full/12.jpg', cap: 'Экран плейлиста', alt: 'Экран плейлиста с обложкой и треками' },
      { thumb: 'images/projects/playlist-maker/thumbs/13.jpg', full: 'images/projects/playlist-maker/full/13.jpg', cap: 'Пустой плейлист', alt: 'Плейлист без треков' },
      { thumb: 'images/projects/playlist-maker/thumbs/14.jpg', full: 'images/projects/playlist-maker/full/14.jpg', cap: 'Редактирование плейлиста', alt: 'Редактирование обложки, названия и описания плейлиста' },
      { thumb: 'images/projects/playlist-maker/thumbs/15.jpg', full: 'images/projects/playlist-maker/full/15.jpg', cap: 'Удаление плейлиста', alt: 'Меню плейлиста и подтверждение удаления' },
      { thumb: 'images/projects/playlist-maker/thumbs/16.jpg', full: 'images/projects/playlist-maker/full/16.jpg', cap: 'Настройки', alt: 'Экран настроек' }
    ]
  },
  {
    num: '03',
    title: 'Агрегатор вакансий',
    kind: 'Дипломный проект для Яндекс Практикума',
    hue: '#3771E5',
    icon: 'images/icons/vacancies.svg',
    stack: 'Kotlin · Compose · MVVM · Coroutines · Room · Retrofit · Koin',
    role: 'Разработчик в команде из 4 человек',
    part: 'Дизайн, тестирование и разработка',
    time: '3 недели',
    about: 'Дипломный проект для Яндекс Практикума: Android-приложение для поиска вакансий через внешний API. Сейчас этот API больше не поддерживается, поэтому вакансии не загружаются. Но проект остаётся хорошим примером ряда технических решений: в нём большая сеть фильтров, и часть их тоже подгружалась с API.',
    features: [
      'Поиск вакансий по запросу, пустые состояния и состояния ошибок с иллюстрациями',
      'Карточка вакансии: зарплата, работодатель и адрес, опыт, график, описание, ключевые навыки и контакты',
      'Избранное и «Поделиться» вакансией',
      'Сеть фильтров: место работы (страна и регион), отрасль, ожидаемая зарплата, «Не показывать без зарплаты»',
      'Списки стран, регионов и отраслей для фильтров загружались с API, с поиском по ним',
      'Экран команды с ролями участников'
    ],
    tech: [
      'UI на Jetpack Compose, навигация — Navigation Compose',
      'Архитектура MVVM, асинхронность на Coroutines',
      'Сеть — Retrofit и API поиска вакансий; токен доступа не хранится в репозитории и попадает в BuildConfig на этапе сборки',
      'Локальное хранение — Room, внедрение зависимостей — Koin',
      'CI на GitHub Actions: на каждый pull request собирается APK и запускается статический анализатор detekt'
    ],
    shots: [
      { thumb: 'images/projects/vacancies/thumbs/01.jpg', full: 'images/projects/vacancies/full/01.jpg', cap: 'Поиск вакансий', alt: 'Главный экран поиска вакансий с иллюстрацией' },
      { thumb: 'images/projects/vacancies/thumbs/02.jpg', full: 'images/projects/vacancies/full/02.jpg', cap: 'Вакансия', alt: 'Карточка вакансии: зарплата, работодатель, опыт и описание' },
      { thumb: 'images/projects/vacancies/thumbs/03.jpg', full: 'images/projects/vacancies/full/03.jpg', cap: 'Навыки и контакты', alt: 'Нижняя часть вакансии: ключевые навыки и контакты' },
      { thumb: 'images/projects/vacancies/thumbs/04.jpg', full: 'images/projects/vacancies/full/04.jpg', cap: 'Настройки фильтрации', alt: 'Фильтры: место работы, отрасль, зарплата' },
      { thumb: 'images/projects/vacancies/thumbs/05.jpg', full: 'images/projects/vacancies/full/05.jpg', cap: 'Выбор региона', alt: 'Выбор региона с состоянием ошибки «Не удалось получить список»' },
      { thumb: 'images/projects/vacancies/thumbs/06.jpg', full: 'images/projects/vacancies/full/06.jpg', cap: 'Избранное', alt: 'Список избранных вакансий' },
      { thumb: 'images/projects/vacancies/thumbs/07.jpg', full: 'images/projects/vacancies/full/07.jpg', cap: 'Команда', alt: 'Экран «Над приложением работали» с участниками команды' }
    ]
  },
  {
    num: '04',
    title: 'Кулинарное приложение',
    orbitName: 'В разработке',
    kind: 'В разработке',
    wip: true,
    hue: '#6BF0C2'
  }
];

/* Документы о курсе: показываются в разделе «Образование» и в полноэкранном просмотре. */
window.DOCS = [
  { src: 'images/docs/certificate.jpg', alt: 'Сертификат Яндекс Практикума «Android-разработчик расширенный»', cap: 'Сертификат' },
  { src: 'images/docs/reference-1.jpg', alt: 'Справка об обучении, страница 1', cap: 'Справка · стр. 1' },
  { src: 'images/docs/reference-2.jpg', alt: 'Справка об обучении, страница 2', cap: 'Справка · стр. 2' },
  { src: 'images/docs/reference-3.jpg', alt: 'Справка об обучении, страница 3', cap: 'Справка · стр. 3' }
];
