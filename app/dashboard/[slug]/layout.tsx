export default function CourseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-col px-4 py-6 md:px-6 lg:px-7">
      {children}
    </div>
  );
}
